/* End-to-end function contract tests with fictional data and a strict in-memory
   Supabase/storage/mail transport. No credentials or network access are used. */
'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto');
process.env.SUPABASE_URL='https://uwfl-test.invalid';
process.env.SUPABASE_SERVICE_KEY='fictional-service-key';process.env.ADMIN_KEY='fictional-review-key';
const tables=Object.fromEntries(['registrations','panels','sponsors','organisations','uwfl_messages','uwfl_mail_log'].map(t=>[t,[]]));
const objects=new Map(),sent=[],requests=[];
let sequence=100,request=0,failDatabase=false,failMail=false;
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
global.fetch=async (input,options={})=>{
 const url=new URL(input),method=options.method||'GET';requests.push({url:url.href,method});
 if(url.hostname==='script.google.com'){
  const payload=JSON.parse(options.body);assert(!payload.email||payload.email.endsWith('@example.invalid'),'A real recipient entered a test');
  sent.push(payload);if(failMail)throw new Error('Simulated uncertain transport');return json({ok:true});
 }
 assert.equal(url.hostname,'uwfl-test.invalid','Unexpected network request');
 assert.equal(options.headers.apikey,'fictional-service-key');
 if(url.pathname.startsWith('/storage/v1/')){
  const key=url.pathname.slice('/storage/v1/object/'.length);
  if(key.startsWith('sign/')){assert(objects.has(key.slice(5)));return json({signedURL:'/object/'+key+'?token=fictional'});}
  if(method==='POST'){objects.set(key,Buffer.from(options.body));return json({Key:key});}
  if(method==='HEAD')return new Response(null,{status:objects.has(key)?200:404});
  return objects.has(key)?new Response(objects.get(key)):json({error:'Missing'},404);
 }
 assert(url.pathname.startsWith('/rest/v1/'));
 if(failDatabase)return json({message:'Database failure with private details that must stay hidden'},500);
 const table=url.pathname.slice('/rest/v1/'.length),rows=tables[table];assert(rows,'Unknown table '+table);
 const matches=row=>[...url.searchParams.entries()].every(([key,value])=>{
  if(['select','order','limit','on_conflict'].includes(key))return true;
  if(value.startsWith('eq.'))return String(row[key])===value.slice(3);
  if(value.startsWith('neq.'))return String(row[key])!==value.slice(4);
  throw new Error('Unsupported filter '+value);
 });
 let result=[];
 if(method==='POST'){
  const data=JSON.parse(options.body),key=url.searchParams.get('on_conflict');
  if(key&&rows.some(r=>r[key]===data[key]))return json([]);
  const row={id:++sequence,...data};if(table==='registrations')row.participant_number=sequence;
  rows.push(row);result=[row];
 }else if(method==='PATCH'){
  const data=JSON.parse(options.body);for(const row of rows.filter(matches)){Object.assign(row,data);result.push(row);}
 }else if(method==='DELETE'){
  result=rows.filter(matches);tables[table]=rows.filter(r=>!matches(r));
 }else{assert.equal(method,'GET');result=rows.filter(matches);}
 const fields=url.searchParams.get('select');if(fields)result=result.map(r=>Object.fromEntries(fields.split(',').map(k=>[k,r[k]??null])));
 return json(result);
};
async function call(name,data,options={}){
 const event={httpMethod:options.method||(data===undefined?'GET':'POST'),headers:{'x-nf-client-connection-ip':'192.0.2.'+(++request),...(options.admin?{'x-admin-key':process.env.ADMIN_KEY}:{})},body:data===undefined?undefined:JSON.stringify(data),queryStringParameters:options.query||{}};
 const result=await require('../netlify/functions/'+name+'.js').handler(event);
 return {status:result.statusCode,data:JSON.parse(result.body||'{}')};
}
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+kf1sAAAAASUVORK5CYII=';
async function photo(endpoint='upload-photo',extra={}){
 const result=await call(endpoint,{fileData:png,fileType:'image/png',fileName:'private-name-email.png',...extra});assert.equal(result.status,200);assert(result.data.url.startsWith('uwfl-pending://'));assert(!result.data.url.includes('private-name'));return result.data.url;
}
const participantData=()=>({request_id:crypto.randomUUID(),naam:'Fictional release maker',email:'maker@example.invalid',land:'NL',telefoon:'+31000000000',type:'Maker',vak:'Wood craft',bericht:'Fictional release story.\nOriginal words stay intact.',lang:'nl',status:'approved'});
const decide=(name,id,action='approve')=>call(name,{}, {admin:true,query:{id:String(id),action}});
(async()=>{
 const d=participantData();
 assert.equal((await call('register',d)).status,400,'Photo must be required on the server');
 assert.equal(tables.registrations.length,0);
 assert.equal((await call('upload-photo',{fileType:'image/png',fileData:'data:image/png;base64,'+Buffer.from('<script>bad</script>').toString('base64')})).status,400);
 d.photo_url=await photo();
 const registration=await call('register',d);assert.equal(registration.status,200);
 assert.equal(tables.registrations[0].status,'pending');assert.equal(tables.registrations[0].message,d.bericht);
 assert.equal((await call('participants')).data.length,0,'Pending participant exposed');
 assert(![...objects.keys()].some(k=>k.startsWith('participant-photos/')),'Pending image copied into public storage');
 const repeat=await call('register',d);assert.equal(repeat.data.participant_number,registration.data.participant_number);assert.equal(tables.registrations.length,1);assert.equal(sent.length,1);
 const number=registration.data.participant_number,credentials={participant_number:number,email:d.email};
 assert.equal((await call('panel-lookup',{...credentials,email:'wrong@example.invalid'})).status,403);
 assert.equal((await call('panel-lookup',credentials)).data.name,d.naam);
 assert.equal((await call('panel-photo',{fileData:png,fileType:'image/png',participant_number:number,email:'wrong@example.invalid'})).status,403);
 const panelPhoto=await photo('panel-photo',credentials);
 const panel={...credentials,request_id:crypto.randomUUID(),artwork_name:'Fictional release panel',wood_species:'Oak',pattern:'Inlay',story:'Fictional story\nsecond line',why:'Passing skills on',meaning:'Connection',materials:'Natural oil',shipping_country:'NL',photos:[panelPhoto],lang:'nl',status:'approved'};
 const submitted=await call('panel-submit',panel);assert.equal(submitted.status,200);assert.equal(tables.panels[0].why,panel.why);assert.equal(tables.panels[0].shipping_country,'NL');assert.equal(tables.panels[0].status,'pending');
 assert.equal((await call('panels')).data.length,0,'Pending panel exposed');
 assert.equal((await call('admin-pending')).status,401);
 assert.equal((await call('approve',undefined,{admin:true,query:{id:String(registration.data.id),action:'approve'}})).status,405,'GET must never approve');
 assert.equal((await decide('approve','1&status=eq.approved')).status,400);
 assert.equal((await decide('panel-approve',submitted.data.id)).data.error,'maker_pending');
 const queue=await call('admin-pending',undefined,{admin:true});assert.equal(queue.status,200);assert(queue.data[0].photo_url.includes('/object/sign/uwfl-review/'));
 const panelQueue=await call('admin-panels-pending',undefined,{admin:true});assert.equal(panelQueue.data[0].meaning,panel.meaning);assert.equal(panelQueue.data[0].shipping_country,'NL');
 assert.equal((await decide('approve',registration.data.id)).status,200);
 const publicPerson=(await call('participants')).data[0];assert(publicPerson.photo_url.includes('/object/public/participant-photos/'));assert(!('email' in publicPerson));assert(!('phone' in publicPerson));
 const beforeMail=sent.length;
 assert.equal((await decide('panel-approve',submitted.data.id)).status,200);
 assert.equal(sent.length,beforeMail+1);assert.equal(sent.at(-1).type,'panel_approved');assert.equal(sent.at(-1).region,'eu');
 assert.equal((await decide('panel-approve',submitted.data.id)).status,409);assert.equal(sent.length,beforeMail+1,'Approval sent duplicate mail');
 const publicPanel=(await call('panels')).data[0];assert.equal(publicPanel.why,panel.why);assert.equal(publicPanel.story,panel.story);assert(!('shipping_country' in publicPanel));assert(!('submitter_email' in publicPanel));assert(publicPanel.photos[0].includes('/object/public/panel-photos/'));
 const {approvalPayload}=require('../netlify/lib/mail');
 assert.equal(approvalPayload({...tables.panels[0],shipping_country:'Canada',country_made:'NL'}).region,'americas');
 assert.equal(approvalPayload({...tables.panels[0],shipping_country:'AU',country_made:'NL'}).region,'other');
 for(const kind of ['sponsor','organisation','media']){
  const org=kind!=='sponsor',endpoint=org?'org-submit':'sponsor-submit',upload=org?'org-logo':'sponsor-logo';
  const data={request_id:crypto.randomUUID(),company:'Fictional sponsor',name:'Fictional organisation',country:'CA',why:'Share skills',what:'Materials',role:'A fictional release profile',category:kind,submitter_email:'partner@example.invalid',logo_url:await photo(upload)};
  const saved=await call(endpoint,data);assert.equal(saved.status,200);
  await call(endpoint,data);assert.equal(tables[org?'organisations':'sponsors'].filter(r=>r.request_id===data.request_id).length,1);
  assert.equal((await call(kind==='organisation'?'organisations':kind==='sponsor'?'sponsors':'media')).data.length,0);
  assert.equal((await decide(org?'org-approve':'sponsor-approve',saved.data.id)).status,200);
  assert.equal((await call(kind==='organisation'?'organisations':kind==='sponsor'?'sponsors':'media')).data.length,1);
 }
 assert.equal((await call('organisations')).data.length,1);assert.equal((await call('media')).data.length,1);
 const contact={request_id:crypto.randomUUID(),name:'Fictional enquiry',email:'contact@example.invalid',message:'Private fictional message',context:'support',lang:'en'};
 const privateMessage=await call('contact-submit',contact);assert.equal(privateMessage.status,200);await call('contact-submit',contact);assert.equal(tables.uwfl_messages.length,1);
 assert.equal((await call('admin-messages-pending')).status,401);
 assert.equal((await call('admin-messages-pending',undefined,{admin:true})).data[0].message,contact.message);
 assert.equal((await decide('message-archive',privateMessage.data.id)).status,200);assert.equal((await call('admin-messages-pending',undefined,{admin:true})).data.length,0);
 const rejected={...participantData(),photo_url:await photo()};const rejectRecord=await call('register',rejected);
 assert.equal((await decide('approve',rejectRecord.data.id,'reject')).status,200);assert.equal(tables.registrations.length,1);
 failDatabase=true;const countBefore=sent.length;
 assert.equal((await call('participants')).status,502,'Upstream errors must not become empty successful reads');
 assert.equal((await call('admin-pending',undefined,{admin:true})).status,502);
 assert.equal((await call('register',{...participantData(),photo_url:await photo()})).status,502);assert.equal(sent.length,countBefore,'Database failure caused email');
 failDatabase=false;failMail=true;
 const uncertain=await call('register',{...participantData(),photo_url:await photo()});assert.equal(uncertain.status,200);assert.equal(uncertain.data.notification,'unconfirmed');
 const status=await call('admin-mail-status',undefined,{admin:true});assert(status.data.some(r=>r.state==='unconfirmed'));assert(status.data.every(r=>!('payload' in r)));
 assert.equal((await call('admin-upload',{}, {admin:true})).status,410,'Old upload can overwrite an approved photo');
 console.log('Release function checks passed: private uploads, required images, real field mapping, review gates, regional dispatch, idempotency, media, private contact, sanitised failures and authentication. No real requests or emails.');
})().catch(error=>{console.error(error);process.exitCode=1;});
