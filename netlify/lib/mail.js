'use strict';
const { db } = require('./core');
const { regionForCountry } = require('../../preview/assets/shipping-policy.js');
// Existing, authorised UWFL mail service. Keep its established payload contract.
// The external script owns the private destination addresses and translated templates.
const SENDER = 'https://script.google.com/macros/s/AKfycbzWD7r75jPpEdAwyTjHHyGYB_WGApbLribkRIXhdchkjRF48W7TeeStunHldq1ybtKG/exec';
async function notify(kind, row, payload) {
  try {
    const key = kind + ':' + row.id;
    const added = await db('uwfl_mail_log?on_conflict=event_key', { method:'POST', headers:{ Prefer:'resolution=ignore-duplicates,return=representation' }, body:JSON.stringify({ event_key:key, kind, record_id:row.id, payload, state:'queued' }) });
    if (!added.length) return 'previously_requested';
    const id = added[0].id;
    await db('uwfl_mail_log?id=eq.' + id + '&state=eq.queued', { method:'PATCH', body:JSON.stringify({ state:'sending', updated_at:new Date().toISOString() }) });
    let state = 'unconfirmed';
    try {
      const response = await fetch(SENDER, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(payload), signal:AbortSignal.timeout(18000) });
      // HTTP success is only acceptance by the service, not proof of mailbox delivery.
      if (response.ok) {
        const raw = await response.text();
        let result; try { result = JSON.parse(raw); } catch {}
        if (result?.ok === true || result?.success === true || ['success','ok'].includes(result?.status) || ['success','ok'].includes(raw.trim().toLowerCase())) state = 'accepted';
      }
    } catch { /* Ambiguous result: do not automatically send the same email twice. */ }
    await db('uwfl_mail_log?id=eq.' + id, { method:'PATCH', body:JSON.stringify({ state, updated_at:new Date().toISOString() }) });
    return state;
  } catch { return 'unconfirmed'; }
}
function approvalPayload(panel) {
  return { type:'panel_approved', naam:[panel.first_name,panel.last_name].filter(Boolean).join(' '), email:panel.submitter_email, lang:panel.lang || 'en', participant_number:panel.participant_number, artwork_name:panel.artwork_name,
    region:regionForCountry(panel.shipping_country || panel.country_made) };
}
module.exports = { notify, approvalPayload };
