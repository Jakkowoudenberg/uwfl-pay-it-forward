exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Simple admin key check
  const adminKey = event.headers['x-admin-key'];
  if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { participantName, fileData, fileType } = body;

    if (!participantName || !fileData) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing data' }) };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    // Validate it is really an image (same checks as upload-photo)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (fileType && !allowedTypes.includes(fileType)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid file type. Only images allowed.' }) };
    }
    if (!fileData.startsWith('data:image/')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid file format.' }) };
    }

    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Max 10MB after decode
    if (buffer.length > 10 * 1024 * 1024) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'File too large.' }) };
    }

    const safeName = participantName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeName}.jpg`;

    // Upload
    const uploadResp = await fetch(
      `${SUPABASE_URL}/storage/v1/object/participant-photos/${fileName}`,
      {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'image/jpeg',
          'x-upsert': 'true'
        },
        body: buffer
      }
    );

    if (!uploadResp.ok) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: await uploadResp.text() }) };
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/participant-photos/${fileName}`;

    // Update DB
    const dbResp = await fetch(
      `${SUPABASE_URL}/rest/v1/registrations?name=eq.${encodeURIComponent(participantName)}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ photo_url: publicUrl })
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: publicUrl, db: dbResp.status })
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
