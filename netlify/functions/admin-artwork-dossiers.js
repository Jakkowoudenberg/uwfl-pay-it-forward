'use strict';
const c=require('../lib/core'),{signed}=require('../lib/artwork-dossier');
exports.handler=c.endpoint('GET',async()=>{const rows=await c.db('artwork_dossiers?order=created_at.desc&limit=200');return Promise.all(rows.map(async row=>{const item=await signed(row);return {id:row.panel_id,participant_number:row.participant_number,name:row.details.title,artwork_name:row.details.title,dossier:item,created_at:row.created_at};}));},true);
