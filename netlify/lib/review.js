'use strict';
const { db, fail, validId, endpoint } = require('./core');
const { reviewUrl, publishImage } = require('./images');
const { notify, approvalPayload } = require('./mail');
const fields = {
  registrations:'id,name,company,country,type,trade,message,photo_url,participant_number,email,phone,created_at',
  panels:'id,participant_number,first_name,last_name,company,nationality,country_made,place_made,production_date,artwork_name,wood_species,pattern,story,why,meaning,materials,shipping_country,photos,submitter_email,lang,contact_email,contact_website,contact_phone,created_at',
  sponsors:'id,company,country,logo_url,why,what,contact_website,contact_email,contact_phone,submitter_email,created_at',
  organisations:'id,name,country,logo_url,role,category,contact_website,contact_email,contact_phone,submitter_email,created_at',
  uwfl_messages:'id,name,company,email,message,context,lang,created_at'
};
function pending(table) {
  return endpoint('GET',async () => {
    const rows = await db(table + '?select=' + fields[table] + '&status=eq.pending&order=created_at.asc');
    if (!Array.isArray(rows)) fail(502,'service_unavailable');
    return Promise.all(rows.map(async row => {
      const result = { ...row };
      if (row.photo_url) result.photo_url = await reviewUrl(row.photo_url);
      if (row.logo_url) result.logo_url = await reviewUrl(row.logo_url);
      if (Array.isArray(row.photos)) result.photos = await Promise.all(row.photos.map(reviewUrl));
      return result;
    }));
  },true);
}
function decision(table) {
  return endpoint('POST', async event => {
    const { id,action } = event.queryStringParameters || {};
    if (!validId(id) || !['approve','reject'].includes(action)) fail(400,'invalid_decision');
    const rows = await db(table + '?id=eq.' + id + '&status=eq.pending');
    const row = rows[0];
    if (!row) fail(409,'already_reviewed');
    if (action === 'reject') {
      const changed = await db(table + '?id=eq.' + id + '&status=eq.pending',{ method:'DELETE' });
      if (!changed.length) fail(409,'already_reviewed');
      return { ok:true };
    }
    const patch = { status:table === 'uwfl_messages' ? 'handled' : 'approved' };
    if (table === 'panels') {
      // A panel cannot appear before the maker registration has also been reviewed.
      const maker = await db('registrations?participant_number=eq.' + row.participant_number + '&status=eq.approved&select=id');
      if (!maker.length) fail(409,'maker_pending');
      if (!Array.isArray(row.photos) || !row.photos.length) fail(400,'image_required');
      patch.photos = await Promise.all(row.photos.map(value => publishImage(value,'panel-photos')));
    }
    if (table === 'registrations') patch.photo_url = await publishImage(row.photo_url,'participant-photos');
    if (table === 'sponsors') patch.logo_url = await publishImage(row.logo_url,'sponsor-logos');
    if (table === 'organisations') patch.logo_url = await publishImage(row.logo_url,'org-logos');
    // The pending condition makes concurrent decisions atomic: only one wins.
    const changed = await db(table + '?id=eq.' + id + '&status=eq.pending',{ method:'PATCH',body:JSON.stringify(patch) });
    if (!changed.length) fail(409,'already_reviewed');
    let notification;
    if (table === 'panels') notification = row.submitter_email ? await notify('panel_approved',row,approvalPayload(row)) : 'missing_email';
    return { ok:true,notification };
  },true);
}
const mailStatus = endpoint('GET',async () => {
  const rows = await db('uwfl_mail_log?state=neq.accepted&select=id,kind,record_id,state,created_at&order=created_at.desc&limit=100');
  return rows;
},true);
module.exports = { pending,decision,mailStatus };
