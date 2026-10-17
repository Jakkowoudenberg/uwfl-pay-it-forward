'use strict';
const crypto=require('node:crypto');
const {endpoint,body,validId,fail,db,storage,config,limit}=require('../lib/core');
const {decode}=require('../lib/images');
exports.handler=endpoint('POST',async event=>{
 limit(event,12,'admin-profile-photo');
 const data=body(event);if(!validId(data.id)||typeof data.name!=='string')fail(400,'invalid_fields');
 const rows=await db('registrations?id=eq.'+data.id+'&status=eq.approved&select=id,name');
 if(rows.length!==1||rows[0].name!==data.name)fail(409,'profile_changed');
 const image=decode(data),path='participant-photos/'+crypto.randomUUID()+'.'+image.ext;
 const response=await storage('object/'+path,{method:'POST',headers:{'Content-Type':image.type,'x-upsert':'false'},body:image.bytes});
 if(!response.ok)fail(502,'upload_failed');
 const photo_url=config().url+'/storage/v1/object/public/'+path;
 const changed=await db('registrations?id=eq.'+data.id+'&status=eq.approved&name=eq.'+encodeURIComponent(data.name),{method:'PATCH',body:JSON.stringify({photo_url})});
 if(changed.length!==1)fail(409,'profile_changed');
 return {ok:true,id:changed[0].id,name:changed[0].name,photo_url};
},true);
