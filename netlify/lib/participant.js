'use strict';
const { db, fail, email } = require('./core');
const { verifiedUser } = require('./participant-auth');
async function participant(data) {
  const number = String(data.participant_number || data.participantNumber || '');
  if (!/^[0-9]{1,9}$/.test(number) || +number < 1) fail(400, 'missing_credentials');
  const user = await verifiedUser(data.access_token);
  const supplied = email(data.email || '', false);
  const rows = await db('registrations?select=name,company,country,email,participant_number,status&participant_number=eq.' + Number(number));
  const row = rows[0];
  // Only the provider-verified mailbox grants access; no legacy bypass.
  if (!row || !['pending','approved'].includes(row.status) || !row.email ||
      row.email.trim().toLowerCase() !== user.email || (supplied && supplied !== user.email)) fail(403,'credentials_mismatch');
  return row;
}
module.exports = { participant };
