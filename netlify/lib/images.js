'use strict';
const crypto = require('node:crypto');
const { fail, config, storage, endpoint, body, limit } = require('./core');
const buckets = ['participant-photos','panel-photos','sponsor-logos','org-logos'];
const types = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
function pendingPath(value, bucket) {
  const match = /^uwfl-pending:\/\/(participant-photos|panel-photos|sponsor-logos|org-logos)\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/.exec(String(value || ''));
  return match && (!bucket || bucket === match[1]) ? match[1] + '/' + match[2] : '';
}
function assertImage(value, bucket) {
  if (!pendingPath(value, bucket)) fail(400, 'image_required');
  return value;
}
async function exists(value, bucket) {
  const path = pendingPath(value, bucket);
  if (!path) fail(400, 'image_required');
  const response = await storage('object/uwfl-review/' + path, { method: 'HEAD' });
  if (!response.ok) fail(400, 'image_unavailable');
  return value;
}
function decode(data) {
  if (typeof data.fileData !== 'string' || data.fileData.length > 5.6e6) fail(400, 'image_too_large');
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(data.fileData);
  if (!match || data.fileType !== match[1]) fail(400, 'invalid_image');
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length < 12 || bytes.length > 4 * 1024 * 1024) fail(400, 'image_too_large');
  let ext = '';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ext = 'jpg';
  else if (bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) ext = 'png';
  else if (bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP') ext = 'webp';
  if (!ext || types[ext] !== match[1]) fail(400, 'invalid_image');
  return { bytes, ext, type: match[1] };
}
function upload(bucket, authenticate) {
  if (!buckets.includes(bucket)) throw new Error('Invalid bucket');
  return endpoint('POST', async event => {
    limit(event, 24);
    const data = body(event);
    if (authenticate) await authenticate(data);
    const image = decode(data), path = bucket + '/' + crypto.randomUUID() + '.' + image.ext;
    const response = await storage('object/uwfl-review/' + path, { method:'POST', headers: { 'Content-Type': image.type, 'x-upsert':'false' }, body:image.bytes });
    if (!response.ok) fail(502, 'upload_failed');
    return { url: 'uwfl-pending://' + path };
  });
}
async function reviewUrl(value) {
  const path = pendingPath(value);
  if (!path) return value; // Previously submitted assets retain their existing URL.
  const response = await storage('object/sign/uwfl-review/' + path, { method:'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ expiresIn: 1800 }) });
  if (!response.ok) fail(502, 'image_unavailable');
  const data = await response.json(), signed = data.signedURL || data.signedUrl;
  if (!signed || !signed.startsWith('/object/sign/uwfl-review/')) fail(502, 'image_unavailable');
  return config().url + '/storage/v1' + signed;
}
async function publishImage(value, bucket) {
  const path = pendingPath(value, bucket);
  if (!path) {
    // Legacy reviewed files stay where they are; arbitrary external URLs are not fetched.
    if (typeof value === 'string' && value.startsWith(config().url + '/storage/v1/object/public/' + bucket + '/')) return value;
    fail(400, 'image_required');
  }
  const source = await storage('object/uwfl-review/' + path);
  if (!source.ok) fail(502, 'image_unavailable');
  const response = await storage('object/' + path, { method: 'POST', headers: { 'Content-Type': types[path.split('.').pop()], 'x-upsert': 'true' }, body: Buffer.from(await source.arrayBuffer()) });
  if (!response.ok) fail(502, 'image_unavailable');
  return config().url + '/storage/v1/object/public/' + path;
}
module.exports = { pendingPath, assertImage, exists, decode, upload, reviewUrl, publishImage };
