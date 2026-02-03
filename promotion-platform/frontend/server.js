const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3005;

const server = http.createServer((req, res) => {
  console.log('Requisição recebida:', req.url);
  let filePath = req.url;
  
  // Roteamento personalizado
  if (req.url === '/') {
    filePath = '/index.html';
  } else if (req.url === '/admin' || req.url === '/admin/') {
    filePath = '/admin-login.html';
  } else if (req.url === '/admin/login' || req.url === '/admin/login/') {
    filePath = '/admin-login.html';
  } else if (req.url === '/admin/dashboard' || req.url === '/admin/dashboard/') {
    filePath = '/admin-dashboard.html';
  } else if (req.url === '/admin/promotions' || req.url === '/admin/promotions/') {
    filePath = '/admin-promotions.html';
  } else if (req.url === '/admin/ia-generator' || req.url === '/admin/ia-generator/') {
    filePath = '/admin-ia-generator.html';
  } else if (req.url === '/admin/whatsapp' || req.url === '/admin/whatsapp/') {
    filePath = '/admin-whatsapp.html';
  } else if (req.url === '/admin/scraping' || req.url === '/admin/scraping/') {
    filePath = '/admin-scraping.html';
  } else if (req.url === '/admin/settings' || req.url === '/admin/settings/') {
    filePath = '/admin-settings.html';
  } else if (req.url === '/admin/analytics' || req.url === '/admin/analytics/') {
    filePath = '/admin-analytics.html';
  } else if (req.url === '/admin/logs' || req.url === '/admin/logs/') {
    filePath = '/admin-logs.html';
  }
  
  filePath = path.join(__dirname, filePath);
  console.log('Caminho do arquivo:', filePath);
  
  const extname = path.extname(filePath);
  let contentType = 'text/html; charset=utf-8';
  
  switch (extname) {
    case '.css':
      contentType = 'text/css; charset=utf-8';
      break;
    case '.js':
      contentType = 'text/javascript; charset=utf-8';
      break;
    case '.json':
      contentType = 'application/json; charset=utf-8';
      break;
  }
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
            <head>
              <meta charset="UTF-8">
              <title>🔥 Plataforma de Promoções</title>
            </head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1>🔥 Plataforma de Promoções</h1>
              <p>Página não encontrada!</p>
              <div style="margin: 20px;">
                <a href="/" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">🏠 Início</a>
                <a href="/admin" style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">🔐 Admin Login</a>
              </div>
            </body>
          </html>
        `);
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🔥 Servidor frontend rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});