const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const leadsByFingerprint = new Map();
try {
  const envText = fs.readFileSync(path.join(root, '.env'), 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
} catch { /* Local .env is optional. */ }
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), 'application/json; charset=utf-8');
}

function readJson(req, limit = 16_384) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > limit) {
        reject(new Error('Request is too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function validLead(lead) {
  if (!lead || typeof lead !== 'object' || Array.isArray(lead)) return 'Invalid enquiry';
  if (lead.website) return 'Spam rejected';
  if (lead.consent !== true) return 'Please confirm that M24 may contact you about this enquiry';
  if (!/^\d{10}$/.test(String(lead.mobile || '').replace(/\D/g, ''))) return 'Enter a valid 10-digit mobile number';
  if (!['SELL', 'BUY', 'TEST_DRIVE', 'CONTACT'].includes(lead.inquiryType)) return 'Invalid enquiry type';
  if (lead.inquiryType === 'SELL') {
    if (!String(lead.carMakeModel || '').trim()) return 'Enter the car make and model';
    if (!String(lead.year || '').trim()) return 'Select the manufacturing year';
    if (!String(lead.kilometres || '').trim() || !/^\d{1,7}$/.test(String(lead.kilometres))) return 'Enter valid kilometres driven';
  }
  return '';
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'POST' && url.pathname === '/api/enquiries') {
    return readJson(req).then(async lead => {
      const validationError = validLead(lead);
      if (validationError) return sendJson(res, 400, { ok: false, error: validationError });
      const endpoint = process.env.APPS_SCRIPT_URL;
      if (!endpoint) return sendJson(res, 503, { ok: false, error: 'The enquiry form is not connected yet. Please call or WhatsApp the showroom.' });
      let parsedEndpoint;
      try { parsedEndpoint = new URL(endpoint); } catch { return sendJson(res, 500, { ok: false, error: 'The Apps Script URL is not configured correctly.' }); }
      if (parsedEndpoint.protocol !== 'https:' || !parsedEndpoint.hostname.endsWith('google.com') && !parsedEndpoint.hostname.endsWith('googleusercontent.com')) {
        return sendJson(res, 500, { ok: false, error: 'The Apps Script URL must be a trusted Google HTTPS deployment URL.' });
      }
      const fingerprint = `${req.socket.remoteAddress || 'local'}:${lead.mobile}`;
      const now = Date.now();
      if (now - (leadsByFingerprint.get(fingerprint) || 0) < 10_000) return sendJson(res, 429, { ok: false, error: 'Please wait a few seconds before trying again.' });
      leadsByFingerprint.set(fingerprint, now);
      try {
        const upstream = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(lead),
          redirect: 'follow',
          signal: AbortSignal.timeout(15_000),
        });
        const raw = await upstream.text();
        let result;
        try { result = JSON.parse(raw); } catch { result = null; }
        if (!upstream.ok || !result || result.ok !== true || !result.leadId) {
          leadsByFingerprint.delete(fingerprint);
          return sendJson(res, 502, { ok: false, error: result?.error || 'The spreadsheet did not confirm the enquiry. Please try again or call the showroom.' });
        }
        return sendJson(res, 200, { ok: true, leadId: result.leadId });
      } catch {
        leadsByFingerprint.delete(fingerprint);
        return sendJson(res, 502, { ok: false, error: 'Could not reach the spreadsheet service. Please retry or call the showroom.' });
      }
    }).catch(error => sendJson(res, error.message === 'Request is too large' ? 413 : 400, { ok: false, error: error.message || 'Invalid request' }));
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method Not Allowed');

  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { return send(res, 400, 'Bad Request'); }
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  let file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) return send(res, 403, 'Forbidden');

  if (!path.extname(file) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
  fs.readFile(file, (error, data) => {
    if (error) return send(res, 404, 'Not Found');
    const contentType = types[path.extname(file)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
    if (req.method === 'HEAD') return res.end();
    res.end(data);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`M24 is running at http://127.0.0.1:${port}`);
});
