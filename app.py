
import socketserver
import ssl

from http.server import HTTPServer, SimpleHTTPRequestHandler
from Summarizer import generateSummary

PORT = 8000

class MinutesMadeHandler(SimpleHTTPRequestHandler):

    def do_POST(self):

        print(self.headers)
        length = int(self.headers.get_all('content-length')[0])
        data_string = self.rfile.read(length)

        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.flush_headers()

        resp = generateSummary(data_string.decode("utf-8"))

        self.wfile.write(resp.encode())


def main():

    httpd = HTTPServer(('localhost', PORT), MinutesMadeHandler)
    httpd.socket = ssl.wrap_socket (httpd.socket, server_side=True, certfile='yourpemfile.pem')
    print("MinuteMade server started at port: ", PORT)

    httpd.serve_forever()


if __name__ == "__main__":
    main()
