exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const adminKey = event.headers['x-admin-key'];
  if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const select = [
      'id', 'participant_number', 'first_name', 'last_name', 'company',
      'nationality', 'country_made', 'place_made', 'production_date',
      'artwork_name', 'wood_species', 'pattern', 'story', 'photos',
      'contact_email', 'contact_website', 'contact_phone', 'created_at'
    ].join(',');

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/panels?select=${select}&status=eq.pending&order=created_at.asc`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await response.json();
    return { statusCode: 200, headers, body: JSON.stringify(Array.isArray(data) ? data : []) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
