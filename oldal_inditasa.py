import http.server
import socketserver
import webbrowser
from urllib.parse import urlparse
from urllib.parse import unquote
import json
import os
import shutil


def ins(index, insert, text, rem):
    return text[:index - rem] + insert + text[index:]

class m(http.server.SimpleHTTPRequestHandler):
	def do_GET(self):
		if self.path == '/':
			self.path = '/index.html'
		elif self.path == "/lol":
			self.send_response(302)
			self.send_header('Location', "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
			self.end_headers()
			return
		return http.server.SimpleHTTPRequestHandler.do_GET(self)
	def do_POST(self):
		queries = dict(x.split("=") for x in urlparse(self.path).query.split("&"))
		print(queries)
		if "/save" in self.path:
			topic_name : str = unquote(queries["n"])
			content_length = int(self.headers['Content-Length'])
			post_data = self.rfile.read(content_length).decode('utf-8')

			post_json : json = json.loads(post_data)
			print(post_json)
			
			if(topic_name != ""): os.makedirs(f'quizes/{topic_name}', exist_ok=True)
			if(post_json[0] != None):
				quiz_num = int(queries["q"])
				with open(f"quizes\\{topic_name}\\{quiz_num+1}.html", "w", encoding="utf-8") as f:
					f.write(post_json[0])
			if(post_json[1] != None):
				with open(f"quizes\\{topic_name}\\files.js", "w", encoding="utf-8") as f:
					f.write(post_json[1])
			if(post_json[2] != None):
				with open("scr\\files.js", "w", encoding="utf-8") as f:
					f.write(post_json[2])
			if(post_json[3] != None):
				with open(f"quizes\\{topic_name}\\index.html", "w", encoding="utf-8") as f:
					f.write(post_json[3])
		elif "/del" in self.path:
			topic_name : str = unquote(queries["n"])
			isQuiz = int(queries["i"]) == 1
			delete_path = f'quizes/{topic_name}'
			if(isQuiz):
				os.remove(delete_path)

				topic_name_last_slash = topic_name.rfind("/")
				real_topic_name = topic_name[0 : topic_name_last_slash]
				quiz_num = int(queries["q"])+1
				path = f"quizes/{real_topic_name}/{quiz_num}.html"

				while(os.path.exists(path)):
					text = ""
					with open(path, "r+", encoding="utf-8") as f:
						text = f.read()
						start_index = text.find("<title>") + len("<title>")
						end_index = text.find(".", start_index)
						num = text[start_index : end_index]
						text = ins(end_index, str(int(num) - 1), text, len(num))
					with open(path, "w", encoding="utf-8") as f:
						f.write(text)

					os.rename(path, f"quizes/{real_topic_name}/{quiz_num-1}.html")
					quiz_num += 1
					path = f"quizes/{real_topic_name}/{quiz_num}.html"
			else:
				shutil.rmtree(delete_path)
		elif "/rename" in self.path:
			old_path = unquote(queries["n1"])
			new_path = unquote(queries["n2"])
			os.rename(f"quizes/{old_path}", f"quizes/{new_path}")
		self.send_response(200)
		self.end_headers()

with socketserver.TCPServer(("", 80), m) as httpd:
	print("serving at port", 80)
	#webbrowser.open("http://localhost/index.html")
	httpd.serve_forever()
