'use strict';
const c=require('../lib/core');
exports.handler=c.endpoint('POST',async event=>{const d=c.body(event);if(!c.validId(d.id))c.fail(400,'invalid_id');const rows=await c.db('panels?id=eq.'+d.id);const row=rows[0];if(!row)c.fail(404,'not_found');let patch;
switch(d.action){
case 'request_information':if(row.status!=='pending')c.fail(409,'not_pending');patch={needs_information:true,review_note:c.text(d.note,2000,true)};break;
case 'resume_review':patch={needs_information:false,review_note:null};break;
case 'received':if(row.status!=='approved')c.fail(409,'not_approved');patch={received_at:row.received_at||new Date().toISOString()};break;
case 'not_received':patch={received_at:null};break;
case 'select_expo':if(row.status!=='approved')c.fail(409,'not_approved');patch={expo_selected:true};break;
case 'unselect_expo':patch={expo_selected:false};break;
default:c.fail(400,'invalid_action');}
const changed=await c.db('panels?id=eq.'+d.id+'&status=eq.'+row.status,{method:'PATCH',body:JSON.stringify(patch)});if(!changed.length)c.fail(409,'already_reviewed');return {ok:true};},true);
