const http = require('http'), fs = require('fs'), path = require('path'), url = require('url'), mysql = require('mysql2'), port = process.env.PORT || 3000;
const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'S!caRu19301302', waitForConnections: true, connectionLimit: 10, queueLimit: 0 }).promise();
const MIME_TYPES = { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'application/javascript; charset=utf-8', json: 'application/json; charset=utf-8', jpg: 'image/jpg', png: 'image/png', ico: 'image/x-icon' };
function servirArchivosEstaticos(req, res) {
    let filePath = req.url === '/' ? 'index.html' : req.url, fullPath = path.join(__dirname, 'public', filePath), ext = path.extname(fullPath).substring(1), mimeType = MIME_TYPES[ext];
    if (!mimeType) return enviarError(res);
    fs.readFile(fullPath, (err, data) => err ? enviarError(res) : (res.writeHead(200, { 'Content-Type': mimeType }), res.end(data)));
}
function enviarError(res) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Archivo no encontrado'); }
function leerBody(req) { return new Promise((res, rej) => { let body = ''; req.on('data', c => { body += c; if (body.length > 1e6) { req.destroy(); rej(); } }); req.on('end', () => { try { res(JSON.parse(body)); } catch { rej(); } }); }); }
function enviarJSON(res, status, data) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); }
const server = http.createServer((req, res) => { console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${url.parse(req.url).pathname}`); servirArchivosEstaticos(req, res); });
server.listen(port, () => console.log(`Servidor en puerto ${port}. Ctrl + C para salir`));