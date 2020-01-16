console.log("start");
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
var recognition = new SpeechRecognition();
var recording = false;
recognition.lang = 'en-US';
recognition.continuous = true;
recognition.interimResults = true;
document.getElementById("final-span").innerHTML = JSON.parse(localStorage.getItem("rawSpeech"));


var noteContent = "";
var noteTextarea = document.getElementById('record-btn');
var summarizeTextarea = document.getElementById('summarize-btn');
var summarizeTextFileBtn = document.getElementById('summarize-text-file');
var rawTextFileBtn = document.getElementById('raw-text-file');

recognition.onstart = function() { 
    console.log('Voice recognition activated. Try speaking into the microphone.');
}

recognition.onspeechend = function() {
    console.log('You stopped talking');
    stopRecord();
}

recognition.onspeechstart = function() {
    console.log('You are talking');
}

recognition.onerror = function(event) {
    if(event.error == 'no-speech') {
        console.log("No speech was detected. Try again.");  
    };
}

recognition.onresult = function(event) {
    var interim = "";
    var current = event.resultIndex;

    if (event.results[current].isFinal)
    {
        noteContent += event.results[current][0].transcript + ". ";
    }
    else
    {
        interim += event.results[current][0].transcript;
    }

    document.getElementById("interim-span").innerHTML = interim;
    document.getElementById("final-span").innerHTML = noteContent;
    localStorage.setItem("rawSpeech", JSON.stringify(noteContent));
}

function startRecord()
{
    recognition.start();
    console.log("recording");
    noteTextarea.innerHTML = "End Meeting";
    noteTextarea.setAttribute("onClick", "stopRecord()");
}

function stopRecord()
{
    recognition.stop();
    console.log("stopping");
    noteTextarea.innerHTML = "Start Meeting";
    noteTextarea.setAttribute("onClick", "startRecord()");
    recording = false;
}

function sendforSummary()
{
    var data =  JSON.parse(localStorage.getItem("rawSpeech"));
    var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200)
        {
            displayList(this.responseText);
            localStorage.setItem("sumSpeech", JSON.stringify(noteContent));

        }
    }

    xhr.open( "POST", "app.py");
    xhr.send(data);
    noteContent.innerHTML = "";
}

function clearStorage()
{
    localStorage.clear();
}

function download(filename, text) {
    var el = document.createElement('a');
    el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    el.setAttribute('download', filename);

    el.style.display = 'none';
    document.body.appendChild(el);

    el.click();

    document.body.removeChild(el);
}

function sumDonwload()
{
    download("summarized.txt", JSON.parse(localStorage.getItem("sumSpeech")));
}

function rawDownload()
{
    download("summarized.txt", JSON.parse(localStorage.getItem("rawSpeech")));
}

function displayList(text)
{
    var arrS = text.split(".");
    var newE = document.createElement('ul');
    for (var i =  0; i < arrS.length; ++i) 
    {
        var item = document.createElement("LI");
        item.appendChild(document.createTextNode(arrS[i]));
        newE.appendChild(item);
    }

    document.getElementById("final-span").innerHTML = "";
    document.getElementById("final-span").appendChild(newE);


}

noteTextarea.setAttribute("onClick", "startRecord()");
summarizeTextarea.setAttribute("onClick", "sendforSummary()");
summarizeTextFileBtn.setAttribute("onClick", "sumDonwload()");
rawTextFileBtn.setAttribute("onClick", "rawDownload()");