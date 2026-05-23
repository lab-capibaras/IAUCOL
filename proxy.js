const http  = require('http');
const https = require('https');

const server = http.createServer((req, res) => {

  // Headers CORS para tu localhost
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200); res.end(); return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {

    // Reenviar al servidor real
    const options = {
      hostname: 'observatic.ucol.mx',
      path:     '/ia/ea/?ajax_openai_student=1',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const proxy = https.request(options, (serverRes) => {
      res.writeHead(serverRes.statusCode, { 'Content-Type': 'application/json' });
      serverRes.pipe(res);
    });

    proxy.on('error', e => {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    });

    proxy.write(body);
    proxy.end();
  });
});

server.listen(3000, () => {
  console.log('✅ Proxy corriendo en http://localhost:3000');
});