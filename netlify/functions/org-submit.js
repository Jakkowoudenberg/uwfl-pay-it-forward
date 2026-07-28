exports.handler = async function(event, context) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    const data = JSON.parse(event.body || '{}');
    const name = (data.name || '').trim();
    const role = (data.role || '').trim();
    const logo = (data.logo_url || '').trim();
    if (!name || !role || !logo) return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'missing_required' }) };
    const row = {
      name: name, country: (data.country || '').trim() || null, logo_url: logo, role: role,
      contact_website: (data.contact_website || '').trim() || null,
      contact_email: (data.contact_email || '').trim() || null,
      contact_phone: (data.contact_phone || '').trim() || null,
      submitter_email: (data.submitter_email || data.contact_email || '').trim().toLowerCase() || null,
      lang: (data.lang || 'en'), status: 'pending'
    };
    const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/organisations`, {
      method: 'POST',
      headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify(row)
    });
    if (!insertResp.ok) { const err = await insertResp.text(); return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'insert_failed', detail: err }) }; }
    const saved = await insertResp.json();
    try {
      await fetch('https://script.google.com/macros/s/AKfycbzWD7r75jPpEdAwyTjHHyGYB_WGApbLribkRIXhdchkjRF48W7TeeStunHldq1ybtKG/exec', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'organisation', name: name, email: row.submitter_email, lang: row.lang, country: row.country || '', role: role })
      });
    } catch (e) { /* mail niet kritiek */ }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id: saved[0] && saved[0].id }) };
  } catch (err) { return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) }; }
};
