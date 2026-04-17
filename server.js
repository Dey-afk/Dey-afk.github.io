const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const CONTACTS_FILE = path.join(__dirname, 'contacts.txt');

// Ensure contacts.txt exists
if (!fs.existsSync(CONTACTS_FILE)) {
  fs.writeFileSync(CONTACTS_FILE, 'Portfolio Contact Submissions\n' + '='.repeat(50) + '\n\n');
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve static files
  if (req.method === 'GET') {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);

    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    // MIME types
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.txt': 'text/plain',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
    return;
  }

  // Handle form submissions
  if (req.method === 'POST' && req.url === '/api/contact') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.connection.destroy();
      }
    });

    req.on('end', () => {
      try {
        const params = new URLSearchParams(body);
        const name = params.get('name') || 'N/A';
        const email = params.get('email') || 'N/A';
        const message = params.get('message') || 'N/A';
        const timestamp = new Date().toISOString();

        // Format the contact entry
        const entry = `
Submission Time: ${timestamp}
Name: ${name}
Email: ${email}
Message: ${message}
${'-'.repeat(50)}
`;

        // Append to contacts.txt
        fs.appendFileSync(CONTACTS_FILE, entry);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Contact saved' }));
      } catch (error) {
        console.error('Error processing form:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Server error' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n✅ Portfolio server running at http://localhost:${PORT}`);
  console.log(`📝 Contacts saved to: ${CONTACTS_FILE}\n`);
});
