"""
ตัวเปิดเซิร์ฟเวอร์จำลองสำหรับกิจกรรมลอยกระทงออนไลน์
วิทยาลัยเทคนิคท่าหลวงซีเมนต์ไทยอนุสรณ์
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers for smooth asset loading
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)

    handler = CustomHTTPRequestHandler
    
    # Try preferred port, fallback if busy
    port = PORT
    for attempt in range(5):
        try:
            with socketserver.TCPServer(("", port), handler) as httpd:
                url = f"http://localhost:{port}"
                print("=" * 65)
                print(f"🌸 ลอยกระทงออนไลน์ วิทยาลัยเทคนิคท่าหลวงซีเมนต์ไทยอนุสรณ์ 🌸")
                print(f"🚀 เซิร์ฟเวอร์เริ่มทำงานแล้วที่: {url}")
                print(f"✨ กด Ctrl+C ในหน้าต่างนี้เพื่อหยุดการทำงาน")
                print("=" * 65)
                
                # Automatically open browser
                try:
                    webbrowser.open(url)
                except Exception:
                    pass
                
                httpd.serve_forever()
                break
        except OSError:
            port += 1

if __name__ == "__main__":
    main()
