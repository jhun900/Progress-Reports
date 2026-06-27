import os
from http.server import BaseHTTPRequestHandler
import json
from mistralai import Mistral

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        data = json.loads(body)

        # Initialize the client with the key from your environment variables
        api_key = os.environ.get("MISTRAL_API_KEY")
        client = Mistral(api_key=api_key)

        # Call the API
        response = client.chat.complete(
            model="mistral-small-latest",
            messages=[{"role": "user", "content": data['prompt']}]
        )

        # Send response back
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        # Extract the content and return it
        result = {"content": response.choices[0].message.content}
        self.wfile.write(json.dumps(result).encode())
