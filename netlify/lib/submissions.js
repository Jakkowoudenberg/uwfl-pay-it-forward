'use strict';
const crypto = require('node:crypto');
const c = require('./core'), images = require('./images'), { participant } = require('./participant'), { notify } = require('./mail');
function requestId(data) { return data.request_id || crypto.randomUUID(); }
async function prepare(event, action) {
  c.limit(event, 8);
  const data = c.body(event);
  if (data.website_confirm) c.fail(400, 'invalid_fields');
  await c.recaptcha(data, action);
  return data;
}
async function register(event) {
  const d = await prepare(event, 'register');
  const type = c.text(d.type, 30, true);
  if (!['Maker','Contributor','Participant','Student'].includes(type)) c.fail(400, 'invalid_fields');
  const row = {
    request_id:requestId(d), name:c.text(d.naam,120,true), company:c.text(d.bedrijf,150) || null,
    email:c.email(d.email), country:c.country(d.land), phone:c.text(d.telefoon,60,true), type,
    trade:c.text(d.vak,150,type === 'Maker') || null, message:c.text(d.bericht,4000,true),
    photo_url:images.assertImage(d.photo_url,'participant-photos'), lang:c.language(d.lang), status:'pending'
  };
  await images.exists(row.photo_url,'participant-photos');
  const result = await c.insert('registrations',row), saved = { ...row, ...result.row };
  const notification = result.fresh ? await notify('registration', saved, { type, goedkeuren:'https://app.unitedwoodfloorlayers.com/admin.html', afwijzen:'https://app.unitedwoodfloorlayers.com/admin.html', naam:row.name, bedrijf:row.company || '', email:row.email, land:row.country, telefoon:row.phone, vak:row.trade || '', bericht:row.message, lang:row.lang, participant_number:saved.participant_number, social_post:d.social_post === 'yes' ? 'yes' : 'no' }) : 'previously_requested';
  return { ok:true, id:saved.id, participant_number:saved.participant_number, notification };
}
async function panel(event) {
  const d = await prepare(event, 'panel'), reg = await participant(d);
  const photos = Array.isArray(d.photos) ? d.photos : [];
  if (!photos.length || photos.length > 8) c.fail(400,'image_required');
  for (const value of photos) await images.exists(value,'panel-photos');
  const name = String(reg.name || '').split(/\s+/), first = name.shift() || '';
  const row = {
    request_id:requestId(d), participant_number:reg.participant_number, first_name:first, last_name:name.join(' '),
    company:reg.company || null, country_made:c.country(d.country_made || reg.country),
    shipping_country:c.country(d.shipping_country), artwork_name:c.text(d.artwork_name,200,true),
    wood_species:c.text(d.wood_species,300,true), pattern:c.text(d.pattern,300) || null,
    story:c.text(d.story,4000,true), why:c.text(d.why,2000) || null,
    meaning:c.text(d.meaning,2000) || null, materials:c.text(d.materials,2000) || null,
    photos, status:'pending', submitter_email:reg.email || c.email(d.email), lang:c.language(d.lang)
  };
  const result = await c.insert('panels',row), saved = { ...row, ...result.row };
  const notification = result.fresh ? await notify('panel',saved,{ type:'panel', naam:reg.name, email:row.submitter_email, lang:row.lang, participant_number:row.participant_number, artwork_name:row.artwork_name, company:row.company || '', country:row.country_made, wood:row.wood_species, pattern:row.pattern || '' }) : 'previously_requested';
  return { ok:true,id:saved.id,notification };
}
function partner(isOrganisation) {
  return async event => {
    const d = await prepare(event, isOrganisation ? 'organisation' : 'sponsor'), bucket = isOrganisation ? 'org-logos' : 'sponsor-logos';
    const row = {
      request_id:requestId(d), country:c.country(d.country,false) || null,
      logo_url:images.assertImage(d.logo_url,bucket), contact_website:c.website(d.contact_website),
      contact_email:c.email(d.contact_email,false) || null, contact_phone:c.text(d.contact_phone,60) || null,
      submitter_email:c.email(d.submitter_email || d.contact_email,false) || null,
      lang:c.language(d.lang), status:'pending'
    };
    if (isOrganisation) Object.assign(row,{ name:c.text(d.name,200,true), role:c.text(d.role,8100,true), category:d.category === 'media' ? 'media' : 'organisation' });
    else Object.assign(row,{ company:c.text(d.company,200,true), why:c.text(d.why,4000,true), what:c.text(d.what,4000,true) });
    await images.exists(row.logo_url,bucket);
    const table = isOrganisation ? 'organisations' : 'sponsors';
    const result = await c.insert(table,row), saved = { ...row, ...result.row };
    const payload = { type:isOrganisation ? 'organisation' : 'sponsor', email:row.submitter_email, lang:row.lang, country:row.country || '', ...(isOrganisation ? { name:row.name,role:row.role } : { company:row.company,why:row.why,what:row.what }) };
    const notification = result.fresh ? await notify(table,saved,payload) : 'previously_requested';
    return { ok:true,id:saved.id,notification };
  };
}
async function contact(event) {
  const d = await prepare(event, 'contact');
  const row = { request_id:requestId(d),name:c.text(d.name,120,true),company:c.text(d.company,200) || null,
    email:c.email(d.email),message:c.text(d.message,6000,true),context:c.text(d.context,80) || 'contact',lang:c.language(d.lang),status:'pending' };
  const result = await c.insert('uwfl_messages',row),saved = { ...row,...result.row };
  const notification = result.fresh ? await notify('contact',saved,{ type:row.context === 'suggestion' ? 'Suggestion' : 'Contact', naam:row.name,email:row.email,bericht:[row.context,row.company,row.message].filter(Boolean).join('\n\n'),lang:row.lang }) : 'previously_requested';
  return { ok:true,id:saved.id,notification };
}
module.exports = { register,panel,partner,contact };
