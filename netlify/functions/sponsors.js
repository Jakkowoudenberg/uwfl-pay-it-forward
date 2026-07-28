exports.handler = async function(event, context) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    const select = ['id','company','country','logo_url','why','what','contact_website','contact_email','contact_phone'].join(',');
    // Geen vaste volgorde nodig: de app shuffelt zelf bij het openen.
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/sponsors?select=${select}&status=eq.approved`,
      { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } });
    if (!resp.ok) { const err = await resp.text(); return { statusCode: 500, headers, body: JSON.stringify({ error: err }) }; }
    const data = await resp.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) { return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }; }
};
