
'use strict';
const c=require('../lib/core');
exports.handler=c.endpoint('GET',async event=>{const id=event.queryStringParameters?.id;if(!c.validId(id))c.fail(400,'invalid_id');const rows=await c.db('uwfl_mail_log?id=eq.'+id+'&kind=eq.panel_approved&state=eq.awaiting_sender');const payload=rows[0]?.payload;if(!payload?.text||!payload?.email)c.fail(404,'not_available');return {ok:true,email:payload.email,subject:payload.subject,text:payload.text};},true);
