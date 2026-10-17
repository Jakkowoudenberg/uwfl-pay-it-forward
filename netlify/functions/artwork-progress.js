'use strict';
const c=require('../lib/core'),{participant}=require('../lib/participant');
exports.handler=c.endpoint('POST',async event=>{c.limit(event,12,'artwork-progress');const d=c.body(event);await c.recaptcha(d,'lookup');const reg=await participant(d);const artworks=await c.db('panels?select=id,participant_number,artwork_name,status,needs_information,review_note,received_at,expo_selected,created_at&participant_number=eq.'+reg.participant_number+'&order=created_at.desc');return {ok:true,artworks};});
