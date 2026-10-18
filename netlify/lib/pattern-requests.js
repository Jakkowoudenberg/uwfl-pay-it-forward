'use strict';
const c=require('./core'),{participant}=require('./participant');
const catalogue=require('../../preview/assets/patterns/catalogue.json');
async function rpc(name,d){const out=await c.db('rpc/'+name,{method:'POST',body:JSON.stringify({d})});if(out.error)c.fail(out.error==='not_found'?404:409,out.error);return out;}
async function maker(d){const reg=await participant(d);if(!reg.email||reg.upload_without_email)c.fail(403,'contact_management');return reg;}
const columns='id,pattern_id,title,motivation,collaboration,status,review_note,created_at,updated_at';
async function participantHandler(event){c.limit(event,12,'pattern-requests');const d=c.body(event);await c.recaptcha(d,'lookup');const reg=await maker(d);const n=reg.participant_number;
 if(d.action==='list')return {ok:true,requests:await c.db('pattern_requests?select='+columns+'&participant_number=eq.'+n+'&order=created_at.desc')};
 if(d.action==='submit'){
  if(!c.uuid(d.request_id))c.fail(400,'invalid_request_id');const pattern=d.pattern_id?catalogue.find(p=>p.id===d.pattern_id):null;if(d.pattern_id&&!pattern)c.fail(400,'invalid_pattern');
  return rpc('uwfl_pattern_submit',{request_id:d.request_id,participant_number:n,pattern_id:pattern?.id||null,title:pattern?.name||c.text(d.title,160,true),motivation:c.text(d.motivation,3000,true),collaboration:c.text(d.collaboration,1000,true)});
 }
 if(!['start','withdraw','resubmit'].includes(d.action)||!c.uuid(d.id))c.fail(400,'invalid_action');
 return rpc('uwfl_pattern_transition',{actor:'participant',participant_number:n,id:d.id,expected_status:c.text(d.expected_status,30,true),action:d.action,...(d.action==='resubmit'?{motivation:c.text(d.motivation,3000,true),collaboration:c.text(d.collaboration,1000,true)}:{})});
}
async function adminList(){const rows=await c.db('pattern_requests?order=created_at.desc');const numbers=[...new Set(rows.map(r=>r.participant_number))];if(!numbers.length)return [];const makers=await c.db('registrations?select=participant_number,name,company,country,email&participant_number=in.('+numbers.join(',')+')');return rows.map(r=>({...r,...makers.find(m=>m.participant_number===r.participant_number)}));}
async function adminChange(event){const d=c.body(event);if(!c.uuid(d.id)||!['approve','reject','request_information','release','start','complete'].includes(d.action))c.fail(400,'invalid_action');return rpc('uwfl_pattern_transition',{actor:'admin',id:d.id,expected_status:c.text(d.expected_status,30,true),action:d.action,note:c.text(d.note,2000,d.action==='request_information')});}
module.exports={participantHandler,adminList,adminChange};
