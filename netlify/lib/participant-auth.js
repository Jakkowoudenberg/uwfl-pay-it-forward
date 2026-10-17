'use strict';
const c = require('./core');
const REDIRECT = 'https://unitedwoodfloorlayers.com/participant-login.html';
async function authFetch(path, options = {}, accessToken) {
  const { url, key } = c.config();
  return fetch(url + '/auth/v1/' + path, {
    ...options, headers: { apikey:key, Authorization:'Bearer ' + (accessToken || key), 'Content-Type':'application/json' },
    signal:AbortSignal.timeout(12000)
  });
}
async function verifiedUser(value) {
  const token = c.text(value, 8192);
  if (!token || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) c.fail(401,'login_required');
  const response = await authFetch('user', {}, token);
  if (response.status === 401 || response.status === 403) c.fail(401,'login_required');
  if (!response.ok) c.fail(503,'service_unavailable');
  const user = await response.json();
  if (!user.id || user.role !== 'authenticated' || user.is_anonymous || !user.email_confirmed_at || !user.email) c.fail(401,'login_required');
  return { id:user.id, email:c.email(user.email) };
}
async function requestLink(event) {
  // Explicit activation follows SMTP setup and a real mailbox test.
  if (process.env.PARTICIPANT_EMAIL_LOGIN_READY !== 'true') c.fail(503,'login_unavailable');
  c.limit(event, 3, 'participant-login');
  const data = c.body(event);
  await c.recaptcha(data,'login');
  const number = String(data.participant_number || '');
  if (!/^[1-9][0-9]{0,8}$/.test(String(Number(number))) || !/^[0-9]{1,9}$/.test(number)) c.fail(400,'missing_credentials');
  const supplied = c.email(data.email);
  const rows = await c.db('registrations?select=email,status&participant_number=eq.' + Number(number));
  const row = rows[0];
  // No disclosure of whether a participant/email pair exists.
  if (!row || !['pending','approved'].includes(row.status) || !row.email || row.email.trim().toLowerCase() !== supplied) return {ok:true};
  const response = await authFetch('otp?redirect_to=' + encodeURIComponent(REDIRECT), {
    method:'POST', body:JSON.stringify({email:supplied,create_user:true})
  });
  if (response.status === 429) c.fail(429,'rate_limited');
  if (!response.ok) c.fail(503,'login_unavailable');
  return {ok:true};
}
module.exports = { verifiedUser, requestLink };
