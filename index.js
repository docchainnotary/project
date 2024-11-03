const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const app = express();
const port = process.env.PORT || 3000;

// PHP file handler
app.use((req, res, next) => {
  if (!req.path.endsWith('.php')) {
    return next();
  }

  const phpFile = path.join(process.cwd(), req.path);
  const php = spawn('php-cgi', [phpFile]);
  
  // Prepare environment variables for PHP
  const env = {
    ...process.env,
    SCRIPT_FILENAME: phpFile,
    SCRIPT_NAME: req.path,
    REQUEST_METHOD: req.method,
    QUERY_STRING: req.url.split('?')[1] || '',
    REQUEST_URI: req.url,
    SERVER_NAME: req.hostname,
    SERVER_PORT: port,
    SERVER_PROTOCOL: 'HTTP/1.1',
    CONTENT_TYPE: req.headers['content-type'] || '',
    CONTENT_LENGTH: req.headers['content-length'] || ''
  };

  php.env = env;

  let output = '';
  let error = '';

  php.stdout.on('data', (data) => {
    output += data.toString();
  });

  php.stderr.on('data', (data) => {
    error += data.toString();
  });

  php.on('close', (code) => {
    if (code !== 0) {
      console.error('PHP Error:', error);
      res.status(500).send('PHP execution failed');
      return;
    }

    // Parse PHP-CGI output (headers and body)
    const [headers, ...bodyParts] = output.split('\r\n\r\n');
    const body = bodyParts.join('\r\n\r\n');

    // Set headers
    headers.split('\r\n').forEach(header => {
      const [name, ...values] = header.split(': ');
      res.setHeader(name, values.join(': '));
    });

    res.send(body);
  });

  // Handle POST data
  if (req.method === 'POST') {
    req.pipe(php.stdin);
  }
});

// Serve static files from current directory
app.use(express.static('.', {
  index: false,
  serveIndex: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.txt') || filePath.endsWith('.md')) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }
  }
}));

// Directory listing middleware
app.use(require('serve-index')('.', { 
  icons: true,
  view: 'details'
}));

app.listen(port, () => {
  console.log(`File server running at http://localhost:${port}`);
  console.log(`Serving files from: ${process.cwd()}`);
  console.log('PHP support enabled');
});
