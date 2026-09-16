'use strict';
const { db, fail, email } = require('./core');
async function participant(data) {
  const number = String(data.participant_number || data.participantNumber || '');
  if (!/^[0-9]{1,9}$/.test(number) || +number < 1) fail(400, 'missing_credentials');
  const supplied = email(data.email || '', false);
  const rows = await db('registrations?select=name,company,country,email,participant_number,upload_without_email,status&participant_number=eq.' + Number(number));
  const row = rows[0];
  // Preserve the explicitly authorised legacy exception; never infer it from a missing email.
  if (!row || (row.status !== 'pending' && row.status !== 'approved') || (!row.upload_without_email && (!row.email || row.email.trim().toLowerCase() !== supplied))) fail(403, 'credentials_mismatch');
  return row;
}
module.exports = { participant };
