exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    // Alleen goedgekeurde panelen, en alleen publieke velden.
    // De controle-e-mail uit de aanmelding komt hier NOOIT in; de contactvelden
    // (contact_email/website/phone) zijn door de maker zelf en bewust publiek opgegeven.
    const select = [
      'id', 'participant_number', 'first_name', 'last_name', 'company',
      'nationality', 'country_made', 'place_made', 'production_date',
      'artwork_name', 'wood_species', 'pattern', 'story', 'photos',
      'contact_email', 'contact_website', 'contact_phone', 'created_at'
    ].join(',');

    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/panels?select=${select}&status=eq.approved&order=participant_number.asc,created_at.asc`,
      { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } }
    );

    if (!resp.ok) {
      const err = await resp.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: err }) };
    }

    const data = await resp.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
