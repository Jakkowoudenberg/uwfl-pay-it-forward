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

  const { id, action } = event.queryStringParameters || {};
  if (!id || !action) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing params' }) };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    if (action === 'approve') {
      await fetch(`${SUPABASE_URL}/rest/v1/registrations?id=eq.${id}`, {
        method: 'PATCH',
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
    } else if (action === 'reject') {
      await fetch(`${SUPABASE_URL}/rest/v1/registrations?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
      });
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
