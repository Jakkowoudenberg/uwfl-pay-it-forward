'use strict';
const crypto = require('node:crypto');
const { countryCode } = require('../../preview/assets/shipping-policy.js');
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};
const recaptchaSecret = () => process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET || '';
const reply = (code, data) => ({ statusCode: code, headers, body: JSON.stringify(data) });
const fail = (code, message) => { const error = new Error(message); error.status = code; throw error; };
const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const validId = value => /^(?:[1-9][0-9]{0,15}|[0-9a-f]{8}-[0-9a-f-]{27})$/i.test(String(value || ''));
function text(value, max, required = false) {
  if (value !== undefined && value !== null && typeof value !== 'string') fail(400, 'invalid_fields');
  const result = (value || '').trim();
  if (result.length > max || (required && !result)) fail(400, 'invalid_fields');
  return result;
}
function email(value, required = true) {
  const result = text(value, 254, required).toLowerCase();
  if (result && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) fail(400, 'invalid_email');
  return result;
}
function website(value) {
  const result = text(value, 1000);
  if (!result) return null;
  try { const u = new URL(result); if (u.protocol !== 'https:' || u.username || u.password) throw new Error(); return u.href; }
  catch { fail(400, 'invalid_website'); }
}
function country(value, required = true) {
  const raw = text(value, 100, required);
  return countryCode(raw) || raw;
}
const language = value => ['nl','en','de','fr','es','it'].includes(value) ? value : 'en';
function body(event) {
  try { const data = JSON.parse(event.body || '{}'); if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error(); return data; }
  catch { fail(400, 'invalid_json'); }
}
async function recaptcha(data, action) {
  const secret = recaptchaSecret();
  if (!secret) fail(503, 'service_unavailable');
  const token = text(data.recaptcha_token, 4096, true);
  const params = new URLSearchParams({ secret, response: token });
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) fail(400, 'recaptcha_failed');
  const result = await response.json();
  if (!result.success || (result.action && result.action !== action) || Number(result.score || 0) < 0.4) fail(400, 'recaptcha_failed');
}
function admin(event) {
  const given = String(event.headers?.['x-admin-key'] || event.headers?.['X-Admin-Key'] || '');
  const expected = process.env.ADMIN_KEY || '';
  if (!expected || !given || !crypto.timingSafeEqual(crypto.createHash('sha256').update(given).digest(), crypto.createHash('sha256').update(expected).digest())) fail(401, 'Unauthorized');
}
const limits = new Map();
function limit(event, max = 12) {
  const ip = event.headers?.['x-nf-client-connection-ip'] || event.headers?.['x-forwarded-for'] || 'unknown';
  const key = crypto.createHash('sha256').update(String(ip)).digest('hex');
  const now = Date.now();
  for (const [k,v] of limits) if (v.until < now) limits.delete(k);
  const entry = limits.get(key) || { count: 0, until: now + 60000 };
  entry.count++; limits.set(key, entry);
  if (entry.count > max) fail(429, 'rate_limited');
}
function endpoint(method, fn, protectedRoute = false) {
  return async event => {
    if (event.httpMethod === 'OPTIONS') return reply(200, {});
    try {
      if (event.httpMethod !== method) fail(405, 'method_not_allowed');
      if (protectedRoute) admin(event);
      return reply(200, await fn(event));
    } catch (error) { return reply(error.status || 502, { ok: false, error: error.status ? error.message : 'service_unavailable' }); }
  };
}
function config() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) fail(503, 'service_unavailable');
  return { url, key };
}
async function storage(path, options = {}) {
  const { url, key } = config();
  return fetch(url + '/storage/v1/' + path, { ...options, headers: { apikey: key, Authorization: 'Bearer ' + key, ...options.headers }, signal: AbortSignal.timeout(18000) });
}
async function db(path, options = {}) {
  const { url, key } = config();
  const response = await fetch(url + '/rest/v1/' + path, {
    ...options,
    headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Prefer: 'return=representation', ...options.headers },
    signal: AbortSignal.timeout(18000)
  });
  if (!response.ok) { const error = new Error('database_unavailable'); error.upstream = response.status; throw error; }
  if (response.status === 204) return [];
  const data = await response.json();
  return data;
}
async function insert(table, row) {
  // A retry with the same random request id never creates another submission.
  if (!uuid(row.request_id)) fail(400, 'invalid_request_id');
  const path = table + '?on_conflict=request_id';
  const saved = await db(path, { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify(row) });
  if (saved[0]) return { row: saved[0], fresh: true };
  const previous = await db(table + '?request_id=eq.' + row.request_id + '&select=' + (table === 'registrations' ? 'id,participant_number' : 'id'));
  if (!previous[0]) fail(409, 'submission_unconfirmed');
  return { row: previous[0], fresh: false };
}
module.exports = { headers, reply, fail, uuid, validId, text, email, website, country, language, body, recaptcha, admin, limit, endpoint, config, db, storage, insert };
