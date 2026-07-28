exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    const data = JSON.parse(event.body || '{}');

    const pnr = parseInt(data.participant_number, 10);
    const email = (data.email || '').trim().toLowerCase();
    if (!pnr) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'missing_credentials' }) };
    }

    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/registrations?select=name,company,country,email,participant_number,upload_without_email&participant_number=eq.${pnr}`,
      { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } }
    );
    const rows = await resp.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: false, error: 'not_found' }) };
    }
    const reg = rows[0];

    // Zelfde koppelingsregel als bij het indienen: e-mail moet kloppen,
    // tenzij deze deelnemer gemarkeerd is als upload_without_email.
    if (!reg.upload_without_email) {
      if (!email) {
        return { statusCode: 200, headers, body: JSON.stringify({ ok: false, error: 'email_mismatch' }) };
      }
      if (!reg.email || reg.email.trim().toLowerCase() !== email) {
        return { statusCode: 200, headers, body: JSON.stringify({ ok: false, error: 'email_mismatch' }) };
      }
    }

    // Alleen de velden die het formulier nodig heeft voor de auto-fill.
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        participant_number: reg.participant_number,
        name: reg.name || '',
        company: reg.company || '',
        country: reg.country || ''
      })
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
