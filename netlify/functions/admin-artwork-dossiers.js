'use strict';
const c=require('../lib/core'),{signed}=require('../lib/artwork-dossier');
exports.handler=c.endpoint('GET',async()=>{const [rows,works]=await Promise.all([c.db('artwork_dossiers?order=created_at.desc&limit=200'),c.db('panels?select=id,participant_number,first_name,last_name,artwork_name,status,needs_information,review_note,received_at,expo_selected,created_at&order=created_at.desc&limit=200')]);return Promise.all(works.map(async work=>{const row=rows.find(r=>r.panel_id===work.id);return {...work,name:work.artwork_name,dossier:row?await signed(row):null};}));},true);
