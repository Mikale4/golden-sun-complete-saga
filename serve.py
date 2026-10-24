# Simple no-cache dev server: python serve.py  ->  http://localhost:8765
# Also accepts POST /shot?name=<label> with a PNG data URL body (used by runner/runner.js to save screenshots
# into runner/shots/), POST /log?name=<file> with a text body (runner reports), and POST /asset with a JSON list
# of files to write under assets/ (the generated-art export, tools/export_assets.js).
import http.server, sys, os, base64, re, json
from urllib.parse import urlparse, parse_qs
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
ROOT = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(ROOT, 'runner', 'shots')
class H(http.server.SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()
    def log_message(self, *a): pass
    def _reply(self, code, text):
        body = text.encode('utf-8')
        self.send_response(code); self.send_header('Content-Type', 'text/plain'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)
    # GET /assets/manifest.json lists every file under assets/ (the game loads only what exists)
    def do_GET(self):
        if urlparse(self.path).path == '/assets/manifest.json':
            d = os.path.join(ROOT, 'assets'); files = []
            for base, _, names in os.walk(d):
                for n in names:
                    if n.endswith('.png'): files.append(os.path.relpath(os.path.join(base, n), d).replace(os.sep, '/'))
            body = json.dumps(sorted(files)).encode('utf-8')
            self.send_response(200); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body); return
        return super().do_GET()
    def do_POST(self):
        u = urlparse(self.path); q = parse_qs(u.query)
        n = int(self.headers.get('Content-Length', '0')); body = self.rfile.read(n)
        name = re.sub(r'[^A-Za-z0-9_.-]', '_', (q.get('name') or ['shot'])[0])
        if u.path == '/shot':
            os.makedirs(SHOTS, exist_ok=True)
            data = body.decode('utf-8')
            if ',' in data: data = data.split(',', 1)[1]
            existing = [f for f in os.listdir(SHOTS) if f.endswith('.png')]
            idx = len(existing) + 1
            fn = '%03d_%s.png' % (idx, name)
            with open(os.path.join(SHOTS, fn), 'wb') as f: f.write(base64.b64decode(data))
            return self._reply(200, fn)
        # POST /edit?name=world_tla with a JSON list of [x, y, ch]: the world map editor's hand corrections, kept apart
        # from the generated layout in js/maps/<name>_edits.js so regenerating the layout never loses them
        if u.path == '/edit':
            if name not in ('world_tla', 'world_gs1'): return self._reply(400, 'unknown map')
            edits = json.loads(body.decode('utf-8')); const = 'WORLD_TLA_EDITS' if name == 'world_tla' else 'WORLD_GS1_EDITS'
            lines = ['// Hand corrections to the generated world layout, from tools/world_editor.html: [x, y, tile char]. Applied over',
                     '// js/maps/' + name + '_layout.js when the map is built. Regenerating the layout keeps these; edit them with the editor.',
                     "'use strict';", 'const ' + const + ' = [']
            for e in edits: lines.append('  [%d, %d, %s],' % (int(e[0]), int(e[1]), json.dumps(str(e[2])[:1])))
            lines.append('];')
            with open(os.path.join(ROOT, 'js', 'maps', name + '_edits.js'), 'w', encoding='utf-8', newline=chr(10)) as f: f.write(chr(10).join(lines) + chr(10))
            return self._reply(200, 'saved %d edits' % len(edits))
        if u.path == '/log':
            os.makedirs(os.path.join(ROOT, 'runner'), exist_ok=True)
            with open(os.path.join(ROOT, 'runner', name), 'wb') as f: f.write(body)
            return self._reply(200, 'ok')
        # POST /asset with a JSON list of {path, data}: PNG data URLs saved under assets/<path> (used by tools/export_assets.js)
        if u.path == '/asset':
            items = json.loads(body.decode('utf-8')); n = 0
            for it in items:
                rel = re.sub(r'[^A-Za-z0-9_./-]', '_', it['path']).replace('..', '_').lstrip('/')
                fn = os.path.join(ROOT, 'assets', *rel.split('/')); os.makedirs(os.path.dirname(fn), exist_ok=True)
                data = it['data']
                if data.startswith('data:'):
                    with open(fn, 'wb') as f: f.write(base64.b64decode(data.split(',', 1)[1]))
                else:
                    with open(fn, 'w', encoding='utf-8') as f: f.write(data)
                n += 1
            return self._reply(200, str(n))
        if u.path == '/asset_clear':
            import shutil
            d = os.path.join(ROOT, 'assets')
            if os.path.isdir(d): shutil.rmtree(d)
            return self._reply(200, 'cleared')
        if u.path == '/clear_shots':
            if os.path.isdir(SHOTS):
                for f in os.listdir(SHOTS): os.remove(os.path.join(SHOTS, f))
            return self._reply(200, 'cleared')
        return self._reply(404, 'no')
# reusing an address is helpful on Unix (a restart would trip over TIME_WAIT) but on Windows it lets two servers
# bind the same port and fight over the connections - there the port probe below must be allowed to fail instead
class S(http.server.ThreadingHTTPServer): allow_reuse_address = (os.name != 'nt'); daemon_threads = True

# By default the game is served to the whole local network, so a phone or tablet on the same Wi-Fi can play it
# (http://<this PC's address>:8765). Pass --local to keep it to this machine only.
LOCAL_ONLY = '--local' in sys.argv
HOST = '127.0.0.1' if LOCAL_ONLY else '0.0.0.0'
def lan_ip():
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try: s.connect(('10.255.255.255', 1)); return s.getsockname()[0]
    except Exception: return None
    finally: s.close()
# the asked-for port, or the next free one after it (another project's server may already hold 8765). Binding alone
# does not prove a port is free on Windows - a server on 127.0.0.1 and one on 0.0.0.0 can both hold it and split the
# traffic between them - so each port is knocked on first.
def busy(port):
    import socket
    s = socket.socket(); s.settimeout(0.25)
    try: s.connect(('127.0.0.1', port)); return True
    except Exception: return False
    finally: s.close()
srv = None
for p in range(PORT, PORT + 10):
    if busy(p): continue
    try: srv = S((HOST, p), H); PORT = p; break
    except OSError: continue
if srv is None: raise SystemExit('no free port in %d..%d' % (PORT, PORT + 9))
print('Serving on http://localhost:%d' % PORT, flush=True)
if not LOCAL_ONLY:
    ip = lan_ip()
    if ip: print('On this network:  http://%s:%d   (phone/tablet on the same Wi-Fi)' % (ip, PORT), flush=True)
    print('Windows may ask to allow Python through the firewall the first time - say yes for private networks.', flush=True)
if '--open' in sys.argv:
    import webbrowser, threading
    threading.Timer(0.5, lambda: webbrowser.open('http://localhost:%d/' % PORT)).start()
print('Ctrl+C (or closing this window) stops the server.', flush=True)
srv.serve_forever()
