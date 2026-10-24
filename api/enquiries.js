const recentSubmissions = new Map();

function reply(res, status, payload) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json(payload);
}

function validLead(lead) {
  if (!lead || typeof lead !== 'object' || Array.isArray(lead)) return 'Invalid enquiry.';
  if (String(lead.website || '').trim()) return 'Invalid enquiry.';
  if (lead.consent !== true) return 'Please confirm that M24 may contact you about this enquiry.';
  if (!/^\d{10}$/.test(String(lead.mobile || '').replace(/\D/g, ''))) return 'Enter a valid 10-digit mobile number.';
  if (!['SELL', 'BUY', 'TEST_DRIVE', 'CONTACT'].includes(String(lead.inquiryType || ''))) return 'Invalid enquiry type.';
  if (lead.inquiryType === 'SELL') {
    if (!String(lead.carMakeModel || '').trim() || String(lead.carMakeModel).length > 100) return 'Enter a valid car make and model.';
    if (!String(lead.year || '').trim() || String(lead.year).length > 12) return 'Select the manufacturing year.';
    if (!/^\d{1,7}$/.test(String(lead.kilometres || ''))) return 'Enter valid kilometres driven.';
  }
  const limits = { customerName:100, variant:80, year:12, kilometres:8, fuelType:30, transmission:30,
    conditionNotes:1000, vehicleSlug:120, vehicleName:160, sourcePage:200 };
  for (const [key, max] of Object.entries(limits)) {
    if (String(lead[key] || '').length > max) return 'One or more fields are too long.';
  }
  return '';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(res, 405, { ok: false, error: 'Method not allowed.' });
  }

  const lead = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch { return null; } })() : req.body;
  const validationError = validLead(lead);
  if (validationError) return reply(res, 400, { ok: false, error: validationError });

  const endpoint = process.env.APPS_SCRIPT_URL;
  if (!endpoint) return reply(res, 503, { ok: false, error: 'The enquiry form is not connected yet. Please call or WhatsApp the showroom.' });
  let parsed;
  try { parsed = new URL(endpoint); } catch { return reply(res, 500, { ok: false, error: 'The Apps Script URL is not configured correctly.' }); }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'script.google.com' || !parsed.pathname.startsWith('/macros/s/')) {
    return reply(res, 500, { ok: false, error: 'The Apps Script URL must be a Google web-app deployment URL.' });
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const key = `${ip}:${String(lead.mobile).replace(/\D/g, '')}`;
  const now = Date.now();
  if (now - (recentSubmissions.get(key) || 0) < 10_000) return reply(res, 429, { ok: false, error: 'Please wait a few seconds before trying again.' });
  recentSubmissions.set(key, now);
  if (recentSubmissions.size > 5000) {
    for (const [entry, time] of recentSubmissions) if (now - time > 60_000) recentSubmissions.delete(entry);
  }

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
      recentSubmissions.delete(key);
      return reply(res, 502, { ok: false, error: result?.error || 'The spreadsheet did not confirm the enquiry. Please try again or call the showroom.' });
    }
    return reply(res, 200, { ok: true, leadId: result.leadId });
  } catch {
    recentSubmissions.delete(key);
    return reply(res, 502, { ok: false, error: 'Could not reach the spreadsheet service. Please retry or call the showroom.' });
  }
};
