import http.server
import socketserver
import webbrowser
from urllib.parse import urlparse
import json

class m(http.server.SimpleHTTPRequestHandler):
	def do_GET(self):
		if self.path == '/':
			self.path = '/index.html'
		return http.server.SimpleHTTPRequestHandler.do_GET(self)
	def do_POST(self):
		content_length = int(self.headers['Content-Length'])
		post_data = self.rfile.read(content_length).decode('utf-8')
		post_json = json.loads(post_data)
		print(post_data)
		queries = dict(x.split("=") for x in urlparse(self.path).query.split("&"))
		quiz_num = queries["q"]
		topic_name = queries["n"]
		print(queries)
		with open(f"quizes\\{topic_name}\\files.js", "w", encoding="utf-8") as f:
			f.write(post_json[1])
		with open(f"quizes\\{topic_name}\\{int(quiz_num)+1}.html", "w", encoding="utf-8") as f:
			f.write(post_json[0])
		#with open("scr\\files.js", "w") as f:
		#	f.write("const data=" + post_data)
		self.send_response(200)
		self.end_headers()

with socketserver.TCPServer(("", 80), m) as httpd:
	print("serving at port", 80)
	webbrowser.open("http://localhost/index.html")
	httpd.serve_forever()
