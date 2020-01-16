#!/usr/bin/env python
# coding: utf-8

import numpy as np
import pandas as pd

import networkx as nx

import nltk
# nltk.download()
# nltk.download('punkt') # one time execution
# nltk.download('stopwords') #o ne time execution

from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
from sklearn.metrics.pairwise import cosine_similarity

import re

stop_words = stopwords.words('english')

def remove_stopwords(sen):
    sen_new = " ".join([i for i in sen if i not in stop_words])
    return sen_new

def lemmatizer(sentence):
    tokenize_words = re.split('\W+', sentence)
    wn = nltk.WordNetLemmatizer()
    text = "".join([(wn.lemmatize(w) + " ") for w in tokenize_words])
    return text.strip()

def generateSummary(data):

    print("Generating summary ...")
    # TEXT PROCESSING

    data = data.replace('\n', '')

    # split text into sentences
    sentences = []
    sentences.append(sent_tokenize(data)) 
    sentences = [y for x in sentences for y in x] # flatten list

    # remove punctuations, numbers and special characters
    clean_sentences = pd.Series(sentences).str.replace("[^a-zA-Z]", " ")

    # make alphabets lowercase
    clean_sentences = [s.lower() for s in clean_sentences] 

    # remove stopwords from the sentences
    clean_sentences = [remove_stopwords(r.split()) for r in clean_sentences]

    # lemmatize
    clean_sentences = [lemmatizer(s) for s in clean_sentences]

    # extract vectors
    word_embeddings = {}

    f = open('glove.6B.100d.txt', encoding='utf-8')
    for line in f:
        values= line.split()
        word = values[0]
        coef = np.asarray(values[1:], dtype='float32')
        word_embeddings[word] = coef
    f.close()

    sentence_vectors = []

    for i in clean_sentences:
        if len(i) != 0:
            v = sum([word_embeddings.get(w, np.zeros((100,))) for w in i.split()]) / (len(i.split()) + 0.001)
        else:
            v = np.zeros((100,))
        sentence_vectors.append(v)

    # similarity matrix
    sim_mat = np.zeros([len(sentences), len(sentences)])

    for i in range(len(sentences)):
        for j in range(len(sentences)):
            if i != j:
                sim_mat[i][j] = cosine_similarity(sentence_vectors[i].reshape(1, 100), sentence_vectors[j].reshape(1, 100))[0,0]

    nx_graph = nx.from_numpy_array(sim_mat)
    scores = nx.pagerank(nx_graph)

    # summary Extraction
    ranked_sentences = sorted(((scores[i], s) for i, s in enumerate(sentences)), reverse=True)

    # extract top 10% of the total sentences as the summary

    result = ""
    for i in range(round(len(sentences) *  0.2) + 1):
        result+= ranked_sentences[i-1][1]

    print("done.")
    return result

