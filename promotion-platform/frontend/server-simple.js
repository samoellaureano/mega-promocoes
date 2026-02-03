const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3005;

const server = http.createServer((req, res) => {
  console.log('Requisição:', req.url);
  
  let filePath = req.url;
  
  // Roteamento das páginas admin
  const routes = {
    '/': 'index.html',
    '/admin': 'admin-login.html',
    '/admin/': 'admin-login.html',
    '/admin/login': 'admin-login.html',
    '/admin/dashboard': 'admin-dashboard.html',
    '/admin/promotions': 'admin-promotions.html',
    '/admin/ia-generator': 'admin-ia-generator.html',
    '/admin/whatsapp': 'admin-whatsapp.html',
    '/admin/scraping': 'admin-scraping.html',
    '/admin/settings': 'admin-settings.html',
    '/admin/analytics': 'admin-analytics.html',
    '/admin/logs': 'admin-logs.html'
  };
  
  if (routes[req.url]) {
    filePath = routes[req.url];
  }
  
  const fullPath = path.join(__dirname, filePath);
  console.log('Arquivo solicitado:', fullPath);
  
  // Determinar tipo de conteúdo
  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'text/html; charset=utf-8';
  
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
  };
  
  if (mimeTypes[ext]) {
    contentType = mimeTypes[ext];
  }
  
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      console.log('Erro ao ler arquivo:', err.message);
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
            <head>
              <meta charset="UTF-8">
              <title>404 - Página não encontrada</title>
            </head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1>🔥 Plataforma de Promoções</h1>
              <h2>404 - Página não encontrada!</h2>
              <p>URL solicitada: ${req.url}</p>
              <p>Arquivo procurado: ${fullPath}</p>
              <div style="margin: 20px;">
                <a href="/" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">🏠 Início</a>
                <a href="/admin" style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">🔐 Admin Login</a>
              </div>
            </body>
          </html>
        `);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('Erro interno do servidor');
      }
    } else {
      console.log('Arquivo encontrado, enviando resposta');
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🔥 Servidor frontend rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});

// Tratamento de erros do servidor
server.on('error', (err) => {
  console.error('Erro no servidor:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Exceção não capturada:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Rejeição não tratada:', err);
});