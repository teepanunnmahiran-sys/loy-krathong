"""
สคริปต์รวมโค้ดเป็นไฟล์เดียว (Single-File Bundle)
เพื่อนำไปฝัง (Embed Code) ใน Google Sites ได้ทันทีโดยไม่ต้องแยกไฟล์
"""

import os
import re
import sys

# Configure stdout for UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def bundle():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(base_dir, 'index.html')
    css_path = os.path.join(base_dir, 'css', 'styles.css')
    
    js_files = [
        'audio.js',
        'storage.js',
        'krathong-builder.js',
        'card-generator.js',
        'temple-fair.js',
        'river-canvas.js',
        'app.js'
    ]

    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()

    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()

    # Replace <link rel="stylesheet" href="css/styles.css"> with <style>...</style>
    style_tag = f"<style>\n{css}\n</style>"
    html = re.sub(r'<link\s+rel=["\']stylesheet["\']\s+href=["\']css/styles\.css["\']\s*>', lambda m: style_tag, html)

    # Combine all JS
    combined_js = []
    for js_name in js_files:
        js_p = os.path.join(base_dir, 'js', js_name)
        with open(js_p, 'r', encoding='utf-8') as f:
            combined_js.append(f"/* === {js_name} === */\n" + f.read())

    all_js_code = "\n\n".join(combined_js)
    script_bundle = f"<script>\n{all_js_code}\n</script>"

    # Replace individual script tags
    # <script src="js/audio.js"></script> ... <script src="js/app.js"></script>
    script_pattern = r'<script\s+src=["\']js/audio\.js["\']></script>.*?<script\s+src=["\']js/app\.js["\']></script>'
    html = re.sub(script_pattern, lambda m: script_bundle, html, flags=re.DOTALL)

    output_path = os.path.join(base_dir, 'loy_krathong_google_sites.html')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"✅ รวมไฟล์สำหรับ Google Sites สำเร็จเรียบร้อย!")
    print(f"📄 บันทึกไฟล์ที่: {output_path}")
    print(f"📦 ขนาดไฟล์: {len(html.encode('utf-8')):,} bytes")

if __name__ == '__main__':
    bundle()
