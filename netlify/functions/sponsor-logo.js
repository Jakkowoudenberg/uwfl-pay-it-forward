exports.handler = async function(event, context) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  try {
    const body = JSON.parse(event.body);
    const { fileData, fileType } = body;
    if (!fileData) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing file data' }) };
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(fileType)) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid file type.' }) };
    if (!fileData.substring(0, 50).startsWith('data:image/')) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid file format.' }) };
    const base64Data = fileData.replace(/^data:image\/[\w+]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length > 5 * 1024 * 1024) return { statusCode: 400, headers, body: JSON.stringify({ error: 'File too large.' }) };
    const ext = fileType === 'image/png' ? 'png' : (fileType === 'image/svg+xml' ? 'svg' : (fileType === 'image/webp' ? 'webp' : 'jpg'));
    const uniqueName = `sponsor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/sponsor-logos/${uniqueName}`, {
      method: 'POST',
      headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': fileType, 'x-upsert': 'true' },
      body: buffer
    });
    if (!uploadResponse.ok) { const err = await uploadResponse.text(); return { statusCode: 500, headers, body: JSON.stringify({ error: 'Upload failed: ' + err }) }; }
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/sponsor-logos/${uniqueName}`;
    return { statusCode: 200, headers, body: JSON.stringify({ url: publicUrl }) };
  } catch (err) { return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }; }
};
