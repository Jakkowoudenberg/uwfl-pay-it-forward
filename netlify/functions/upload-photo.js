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
    const body = JSON.parse(event.body);
    const { fileName, fileData, fileType, participantEmail, participantName } = body;

    if (!fileName || !fileData) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing file data' }) };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    // Decode base64 image
    // LAAG 1: Validate file type server-side
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(fileType)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid file type. Only images allowed.' }) };
    }
    
    // Check base64 magic bytes to verify it's really an image
    const base64Header = fileData.substring(0, 50);
    if (!base64Header.startsWith('data:image/')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid file format.' }) };
    }
    
    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Check file size (max 10MB after decode)
    if (buffer.length > 10 * 1024 * 1024) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'File too large.' }) };
    }

    // Create unique filename
    const safeName = (participantName || participantEmail || 'participant')
      .replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const uniqueName = `${safeName}_${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const uploadResponse = await fetch(
      `${SUPABASE_URL}/storage/v1/object/participant-photos/${uniqueName}`,
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

    if (!uploadResponse.ok) {
      const err = await uploadResponse.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Upload failed: ' + err }) };
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/participant-photos/${uniqueName}`;

    // Update registrations table if participantName provided
    if (participantName) {
      await fetch(
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
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: publicUrl })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
