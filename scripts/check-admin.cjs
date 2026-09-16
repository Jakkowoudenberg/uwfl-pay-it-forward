/* Offline management checks. Every submission and password is fictional.
   No network access, production record changes or emails occur in this script. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const root=path.resolve(__dirname,'../preview');
const code=['translations.js','admin-copy.js','panel-story.js','admin.js'].map(n=>fs.readFileSync(path.join(root,'assets',n),'utf8'));
const reads={'admin-pending':'registrations','admin-panels-pending':'panels','admin-sponsors-pending':'sponsors','admin-orgs-pending':'organisations'};
const writes={approve:'registrations','panel-approve':'panels','sponsor-approve':'sponsors','org-approve':'organisations'};
const secret='fictional-test-password';
const fixtures={
 registrations:[{id:41,name:'Fictional applicant',country:'NL',type:'Contributor',message:'PRIVATE-FIXTURE <img src=x onerror="alert(1)">\nA fictional story.',photo_url:'javascript:alert(1)'}],
 panels:[{id:'e5d69d87-7b4e-4d0e-a39e-cf8bf17a0712',artwork_name:'Fictional panel',first_name:'Demo',last_name:'Maker',participant_number:9999,country_made:'Canada',wood_species:'Oak',story:'Original fictional story.\nSecond line.',why:'A fictional motivation.',meaning:'A fictional meaning.',materials:'Test finish',photos:['https://example.invalid/panel.jpg','javascript:alert(1)'],contact_email:'demo@example.invalid'}],
 sponsors:[{id:43,company:'Fictional sponsor',country:'DE',logo_url:'https://example.invalid/logo.jpg',why:'Fictional motivation',what:'Fictional supplies'}],
 organisations:[{id:44,name:'Fictional association',country:'FR',logo_url:'https://example.invalid/org.jpg',role:'Fictional school'}]
};
const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
async function settled(){for(let n=0;n<5;n++)await pause();}
const clone=value=>JSON.parse(JSON.stringify(value));
const response=(status,data)=>({status,ok:status>=200&&status<300,json:async()=>clone(data)});
async function create({lang='nl',demo=false}={}){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'admin.html'),'utf8'),{url:'https://preview.invalid/admin.html'+(demo?'?demo=1':''),runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document,requests=[],rows=clone(fixtures),control={};
 w.localStorage.setItem('uwfl_preview_lang',lang);w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 w.fetch=async(url,options)=>{
  assert(!demo,'Demo must never use network');
  const u=new URL(url),endpoint=u.pathname.split('/').pop();
  assert.equal(u.origin,'https://app.unitedwoodfloorlayers.com');
  assert.equal(options.cache,'no-store');assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');assert.equal(options.referrerPolicy,'no-referrer');
  assert(!u.href.includes(secret),'Password leaked into URL');
  requests.push({endpoint,method:options.method,action:u.searchParams.get('action'),id:u.searchParams.get('id')});
  if(control.unauthorized||options.headers['X-Admin-Key']!==secret)return response(401,{error:'Unauthorized'});
  if(control.hold===endpoint)await new Promise(resolve=>{control.release=resolve;});
  if(control.fail===endpoint)return response(500,{error:'Fictional failure'});
  if(reads[endpoint]){assert.equal(options.method,'GET');return response(200,rows[reads[endpoint]]);}
  assert(writes[endpoint],'Unexpected endpoint');assert.equal(options.method,'POST');
  if(!control.keepPending)rows[writes[endpoint]]=rows[writes[endpoint]].filter(row=>String(row.id)!==u.searchParams.get('id'));
  return response(200,{ok:true});
 };
 for(const source of code)w.eval(source);
 await settled();
 return {w,d,dom,requests,rows,control,close:()=>w.close()};
}
function click(x,selector){const target=x.d.querySelector(selector);assert(target,`Missing ${selector}`);target.click();}
function tab(x,group){click(x,`[data-group="${group}"]`);}
async function login(x,value=secret){x.d.getElementById('admin-password').value=value;click(x,'#admin-login-form button');await settled();}
function privateCleared(x){assert(!x.d.body.textContent.includes('PRIVATE-FIXTURE'));assert(!x.d.querySelector('.admin-review'));assert(!x.d.body.innerHTML.includes(secret));assert.equal(x.w.sessionStorage.length,0);assert.equal(x.w.localStorage.length,1);assert.equal(x.w.localStorage.key(0),'uwfl_preview_lang');}
function mutationCount(x){return x.requests.filter(r=>r.method==='POST').length;}
(async()=>{
 for(const lang of ['nl','en','de','fr','es','it']){
  const x=await create({lang});assert.equal(x.requests.length,0,'Private endpoint used before login');
  for(const [key,values] of Object.entries(x.w.UWFL_UI))assert(values.length===6&&values.every(Boolean),`Incomplete label: ${key}`);
  await login(x,'wrong-fictional-password');assert(x.d.querySelector('#admin-login-error:not([hidden])'));privateCleared(x);
  await login(x);assert.equal(x.d.querySelectorAll('[data-group]').length,4);assert.equal(x.d.querySelector('#admin-password'),null);
  assert(x.d.querySelector('.admin-review-body').textContent.includes('<img src=x onerror="alert(1)">'));assert.equal(x.d.querySelectorAll('[onerror]').length,0);assert(!x.d.querySelector('a[href^="javascript:"]'));
  assert(!x.d.body.innerHTML.includes(secret));
  const search=x.d.querySelector('#admin-search');search.value='no matching fictional name';search.dispatchEvent(new x.w.Event('input',{bubbles:true}));assert.equal(x.d.querySelectorAll('.admin-review').length,0);search.value='applicant';search.dispatchEvent(new x.w.Event('input',{bubbles:true}));assert.equal(x.d.querySelectorAll('.admin-review').length,1);
  tab(x,'panels');assert(x.d.body.textContent.includes('A fictional meaning.'));assert(x.d.body.textContent.includes('Test finish'));assert.equal(x.d.querySelectorAll('.admin-images img').length,1);
  for(const group of Object.values(reads)){tab(x,group);assert.equal(x.d.querySelectorAll('.admin-review').length,1);}
  click(x,'[data-admin="logout"]');privateCleared(x);x.close();
 }
 const approval=await create();await login(approval);tab(approval,'panels');
 const n=approval.requests.length;const oldButton=approval.d.querySelector('[data-admin="approve"]');oldButton.click();oldButton.click();await settled();
 assert.equal(mutationCount(approval),1,'Repeated click duplicated approval');
 assert.deepEqual(approval.requests.slice(n).map(r=>r.method),['GET','POST','GET'],'Approval needs pre-read and post-read');
 assert.equal(approval.requests[n+1].endpoint,'panel-approve');assert.equal(approval.requests[n+1].action,'approve');
 assert(approval.d.querySelector('.admin-message:not([hidden])'));assert.equal(approval.d.querySelectorAll('.admin-review').length,0);approval.close();
 const rejection=await create();await login(rejection);tab(rejection,'sponsors');click(rejection,'[data-admin="reject"]');
 assert(rejection.d.querySelector('dialog').open);assert(rejection.d.querySelector('dialog').textContent.includes('definitief'));assert.equal(mutationCount(rejection),0);
 click(rejection,'[data-admin="cancel"]');assert.equal(mutationCount(rejection),0);click(rejection,'[data-admin="reject"]');click(rejection,'[data-admin="confirm-reject"]');await settled();
 assert.equal(mutationCount(rejection),1);assert(rejection.requests.some(r=>r.endpoint==='sponsor-approve'&&r.action==='reject'));rejection.close();
 const stale=await create();await login(stale);stale.rows.registrations=[];click(stale,'[data-admin="approve"]');await settled();assert.equal(mutationCount(stale),0);assert(stale.d.body.textContent.includes('niet meer ter beoordeling'));stale.close();
 const pending=await create();await login(pending);pending.control.keepPending=true;click(pending,'[data-admin="approve"]');await settled();
 assert.equal(mutationCount(pending),1);assert(pending.d.body.textContent.includes('uitkomst kon niet worden bevestigd'));assert.equal(pending.d.querySelectorAll('[data-admin="approve"]').length,0);assert(!pending.d.querySelector('.admin-message:not([hidden])'));pending.close();
 const failed=await create();failed.control.fail='admin-orgs-pending';await login(failed);tab(failed,'organisations');assert.equal(failed.d.querySelector('[data-group="organisations"] strong').textContent,'—');assert(failed.d.querySelector('#admin-list .admin-error'));assert(!failed.d.querySelector('#admin-list .admin-empty'));failed.close();
 const uncertain=await create();await login(uncertain);uncertain.control.fail='approve';click(uncertain,'[data-admin="approve"]');await settled();assert.equal(mutationCount(uncertain),1);assert(uncertain.d.body.textContent.includes('uitkomst kon niet worden bevestigd'));assert.equal(uncertain.d.querySelectorAll('[data-admin="approve"]').length,0);uncertain.close();
 const revoked=await create();await login(revoked);revoked.control.unauthorized=true;click(revoked,'[data-admin="refresh"]');await settled();privateCleared(revoked);assert(revoked.d.body.textContent.includes('Log opnieuw in'));revoked.close();
 const interrupted=await create();await login(interrupted);interrupted.control.hold='admin-pending';click(interrupted,'[data-admin="approve"]');await settled();click(interrupted,'[data-admin="logout"]');interrupted.control.release();await settled();privateCleared(interrupted);assert.equal(mutationCount(interrupted),0,'Logged-out pre-check continued a mutation');interrupted.close();
 const leaving=await create();await login(leaving);leaving.w.dispatchEvent(new leaving.w.Event('pagehide'));privateCleared(leaving);leaving.close();
 const invalid=await create();invalid.rows.registrations[0].id='41&status=eq.approved';await login(invalid);privateCleared(invalid);assert.equal(mutationCount(invalid),0);invalid.close();
 const demo=await create({demo:true});assert.equal(demo.requests.length,0);assert(demo.d.querySelector('.admin-note.demo'));tab(demo,'panels');click(demo,'[data-admin="approve"]');await settled();assert.equal(demo.d.querySelectorAll('.admin-review').length,0);tab(demo,'organisations');click(demo,'[data-admin="reject"]');click(demo,'[data-admin="confirm-reject"]');await settled();assert.equal(demo.d.querySelectorAll('.admin-review').length,0);assert.equal(demo.requests.length,0);demo.close();
 // The existing production handlers are imported with fake configuration and a mocked fetch.
 // Check their auth, CORS and POST contract without invoking any real service.
 const oldFetch=global.fetch,oldEnv={ADMIN_KEY:process.env.ADMIN_KEY,SUPABASE_URL:process.env.SUPABASE_URL,SUPABASE_SERVICE_KEY:process.env.SUPABASE_SERVICE_KEY};
 let calls=0;process.env.ADMIN_KEY=secret;process.env.SUPABASE_URL='https://database.example.invalid';process.env.SUPABASE_SERVICE_KEY='fictional-service-key';
 global.fetch=async()=>{calls++;return response(200,[]);};
 try{
  for(const endpoint of [...Object.keys(reads),...Object.keys(writes)]){
   const {handler}=require(path.resolve(__dirname,'../netlify/functions',endpoint+'.js'));const before=calls;
   assert.equal((await handler({httpMethod:'OPTIONS',headers:{}})).statusCode,200);
   assert.equal((await handler({httpMethod:'POST',headers:{},queryStringParameters:{id:'9999',action:'reject'}})).statusCode,401);assert.equal(calls,before);
   const result=await handler({httpMethod:reads[endpoint]?'GET':'POST',headers:{'x-admin-key':secret},queryStringParameters:{id:'9999',action:'reject'}});
   assert.equal(result.statusCode,200);assert.equal(result.headers['Access-Control-Allow-Origin'],'*');assert(result.headers['Access-Control-Allow-Headers'].includes('X-Admin-Key'));assert(calls>before);
  }
 }finally{global.fetch=oldFetch;for(const [key,value] of Object.entries(oldEnv)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
 console.log(JSON.stringify({languages:6,authentication:'passed',safeRendering:'passed',approvalAndRejection:'passed',duplicateAndStaleReview:'passed',failureAndLogoutIsolation:'passed',demoNetworkRequests:0,existingServerContract:'passed',productionMutations:0}));
})().catch(error=>{console.error(error);process.exitCode=1;});
