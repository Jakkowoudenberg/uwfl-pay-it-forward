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
    const { fileName, fileData, fileType, participantEmail } = body;

    if (!fileName || !fileData || !fileType) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing file data' }) };
    }

    // Decode base64 image
    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Create unique filename
    const ext = fileType.split('/')[1] || 'jpg';
    const safeName = (participantEmail || 'participant').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const uniqueName = `${safeName}_${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const uploadResponse = await fetch(
      `${process.env.SUPABASE_URL}/storage/v1/object/participant-photos/${uniqueName}`,
      {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'Content-Type': fileType,
          'x-upsert': 'true'
        },
        body: buffer
      }
    );

    if (!uploadResponse.ok) {
      const err = await uploadResponse.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Upload failed: ' + err }) };
    }

    // Return public URL
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/participant-photos/${uniqueName}`;

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
