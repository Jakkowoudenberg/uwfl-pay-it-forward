'use strict';
const c=require('../lib/core'),{participant}=require('../lib/participant'),{signed}=require('../lib/artwork-dossier');
exports.handler=c.endpoint('POST',async event=>{c.limit(event,12,'dossier');const d=c.body(event);await c.recaptcha(d,'lookup');const reg=await participant(d);const rows=await c.db('artwork_dossiers?participant_number=eq.'+reg.participant_number+'&order=created_at.desc');return {ok:true,dossiers:await Promise.all(rows.map(signed))};});
