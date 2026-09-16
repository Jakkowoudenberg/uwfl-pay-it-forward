/* Offline behaviour checks. All people and organisations below are fictional.
   QA-only dependency: JSDOM_PATH=/absolute/path/to/jsdom node scripts/check-preview.cjs
   No requests are made to production and this script is not part of the deployed preview. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const root=path.resolve(__dirname,'../preview');
const code=['content.js','translations.js','experience.js','app.js'].map(n=>fs.readFileSync(path.join(root,'assets',n),'utf8'));
const fixtures={
 participants:[1,2,3,4].map((n)=>({name:`Fictieve Testdeelnemer ${n}`,company:'QA voorbeeld',country:n%2?'NL':'US',type:n===1?'maker':'participant',message:'Fictief verhaal uitsluitend voor de offline test.',photo_url:'https://example.invalid/photo.jpg',participant_number:n})),
 sponsors:[1,2,3].map(n=>({company:`Fictieve Testsponsor ${n}`,country:'NL',logo_url:'https://example.invalid/logo.jpg',why:'Test',what:'Test'})),
 organisations:[1,2,3].map(n=>({name:`Fictieve Testorganisatie ${n}`,country:'NL',logo_url:'https://example.invalid/logo.jpg',role:'Fictieve vereniging'})),
 panels:[1,2,3].map(n=>({id:n,artwork_name:`Fictief Testpaneel ${n}`,participant_number:n,first_name:'Fictief',last_name:'Voorbeeld',story:'Alleen testmateriaal.',photos:['https://example.invalid/panel.jpg'],wood_species:'Eiken',pattern:'Test'}))
};
const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
async function create(lang='nl',random=0){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://preview.invalid/#home',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,requests=[];w.localStorage.setItem('uwfl_preview_lang',lang);w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.URL.createObjectURL=()=>`blob:https://preview.invalid/qa`;w.URL.revokeObjectURL=()=>{};w.Math.random=()=>random;
 w.fetch=async(url,options)=>{requests.push({url,method:options?.method});const key=new URL(url).pathname.split('/').pop();assert(key in fixtures,'Unexpected endpoint');return {ok:true,json:async()=>JSON.parse(JSON.stringify(fixtures[key]))};};
 for(const source of code)w.eval(source);
 await pause();await pause();
 return {dom,w,d:w.document,requests,close:()=>w.close()};
}
async function nav(x,hash){x.w.location.hash=hash;await pause();await pause();}
function fill(x,id,value){const el=x.d.getElementById(id);assert(el,`Missing ${id}`);el.value=value;el.dispatchEvent(new x.w.Event('input',{bubbles:true}));}
function submit(x){const form=x.d.getElementById('work-form');assert(form.checkValidity(),'Test data must pass native validation');form.querySelector('[type="submit"]').click();}
function selectImage(x,id,size=200){const input=x.d.getElementById(id);const file=new x.w.File([new Uint8Array(size)],'fictief-qa.jpg',{type:'image/jpeg'});Object.defineProperty(input,'files',{value:[file],configurable:true});input.dispatchEvent(new x.w.Event('change',{bubbles:true}));}
function ensureReadOnly(x){assert(x.requests.every(r=>r.method==='GET'),'Preview attempted a mutation');}
(async()=>{
 let routeChecks=0;
 const routes=['home','makers','visitors','help','about','partners','sponsor','organisations','organisation','community','gallery','read/project','read/press','read/initiator','read/privacy','read/expo','read/regels','resources','drawing','panel','idea','join','join/maker','join/participant','join/contributor','join/student','upload','contact','contact/support','contact/organisation-support','contact/media'];
 for(const lang of ['nl','en','de','fr','es','it']){
  const x=await create(lang);
  for(const [key,values] of Object.entries(x.w.UWFL_UI))assert(values.length===6&&values.every(v=>v!==undefined&&v!==''),`Incomplete translation: ${key}`);
  for(const route of routes){await nav(x,route);assert.equal(x.d.querySelectorAll('main h1').length,1,`${lang}/${route}: heading`);assert(!/undefined|NaN|\[object Object\]/.test(x.d.querySelector('main').textContent),`${lang}/${route}: invalid content`);routeChecks++;}
  await nav(x,'read/privacy');const first=x.d.querySelector('.reader p').textContent;assert(!/—.*—/.test(first),`${lang}: optional photo wording remains`);assert(x.d.querySelector('.moderation-note'),`${lang}: moderation notice`);
  await nav(x,'read/press');for(const a of x.d.querySelectorAll('a[download]'))assert(fs.existsSync(path.join(root,a.getAttribute('href'))),`Missing press file ${a.getAttribute('href')}`);
  ensureReadOnly(x);x.close();
 }
 const x=await create('nl');
 await nav(x,'resources');
 for(const [term,target] of [['verzenden','#read/expo'],['hoe verstuur ik mijn paneel','#read/expo'],['kosten','#makers'],['foto','#join'],['helpen','#help'],['bouwtekening','#drawing']]){fill(x,'topic-search',term);assert(x.d.querySelector(`#topic-results a[href="${target}"]`),`Search failed: ${term}`);}
 await nav(x,'community');
 const numbers=()=>[...x.d.querySelectorAll('.maker-meta span:last-child')].map(e=>e.textContent);
 const firstOrder=numbers();assert.equal(firstOrder.length,4);assert.notDeepEqual(firstOrder,['#0001','#0002','#0003','#0004']);
 fill(x,'people-search','Fictieve');assert.deepEqual(numbers(),firstOrder);
 const country=x.d.getElementById('people-country');country.value='NL';country.dispatchEvent(new x.w.Event('change',{bubbles:true}));assert.deepEqual(numbers(),firstOrder.filter(n=>['#0001','#0003'].includes(n)));country.value='';country.dispatchEvent(new x.w.Event('change',{bubbles:true}));assert.deepEqual(numbers(),firstOrder);
 for(const route of ['partners','organisations']){await nav(x,route);const order=[...x.d.querySelectorAll('.partner-card h3')].map(e=>e.textContent);await nav(x,'home');await nav(x,route);assert.deepEqual([...x.d.querySelectorAll('.partner-card h3')].map(e=>e.textContent),order);}
 await nav(x,'gallery');const panelTitle=x.d.querySelector('.maker-card h3').textContent;x.d.querySelector('[data-panel-index]').click();assert.equal(x.d.querySelector('main h1').textContent,panelTitle,'Shuffled gallery opened the wrong artwork');
 await nav(x,'contact/support');fill(x,'contact-email','qa-private@example.com');await nav(x,'sponsor');assert.equal(x.d.getElementById('contact-email').value,'','Private enquiry carried into a public profile');
 await nav(x,'join/participant');x.d.querySelector('[data-action="choose-role"]').click();await pause();await pause();assert(x.d.querySelector('.role-grid'),'Changing a preset role did not open the role selector');submit(x);assert(x.d.getElementById('name'),'Role selector did not return to details');x.d.querySelector('[data-action="choose-role"]').click();assert(x.d.querySelector('.role-grid'),'Changing role failed when already on #join');
 ensureReadOnly(x);x.close();
 const alternate=await create('nl',.999);await nav(alternate,'community');assert.notDeepEqual([...alternate.d.querySelectorAll('.maker-meta span:last-child')].map(e=>e.textContent),firstOrder,'New visit did not use a new shuffle');alternate.close();
 for(const role of ['maker','participant','contributor','student']){
  const x=await create();await nav(x,'join/'+role);assert(x.d.getElementById('name'),'Preset role did not go to details');
  for(const [id,value] of [['name','Fictieve Testpersoon'],['email','qa@example.com'],['country','NL'],['phone','+31000000000']])fill(x,id,value);
  if(role==='maker')fill(x,'trade','Houtbewerker');submit(x);fill(x,'story','Fictieve test: ik wil drie mensen helpen.');submit(x);
  assert(x.d.getElementById('form-error').textContent.length,'Missing photo accepted');assert(x.d.getElementById('join-photo'),'Missing photo advanced the form');
  selectImage(x,'join-photo',5*1024*1024+1);assert(x.d.getElementById('form-error').textContent.includes('5'),'Oversized photo accepted');
  selectImage(x,'join-photo');submit(x);assert(x.d.getElementById('agree'),'Review step not reached');x.d.getElementById('agree').checked=true;submit(x);assert(x.d.querySelector('.success-panel .moderation-note'),'Missing review-before-publication message');assert(x.d.querySelector('.success-panel').textContent.includes('niets verstuurd'),'Preview receipt claims a real submission');
  await nav(x,'community');assert.equal(x.d.querySelectorAll('.maker-card').length,4,'Submission appeared publicly');ensureReadOnly(x);x.close();
 }
 for(const kind of ['sponsor','organisation']){
  const x=await create();await nav(x,kind);fill(x,'contact-company','Fictieve QA organisatie');fill(x,'why','Uitsluitend een offline test.');fill(x,'what','Testbijdrage.');submit(x);assert(x.d.getElementById('form-error').textContent.includes('Logo'),'Missing logo accepted');selectImage(x,'sponsor-logo');submit(x);assert(x.d.querySelector('.success-panel .moderation-note'),'Profile lacks moderation explanation');ensureReadOnly(x);x.close();
 }
 const p=await create();await nav(p,'upload');p.d.querySelector('[data-action="sample-upload"]').click();for(const [id,value] of [['artwork-name','Fictief testpaneel'],['wood-species','Eiken'],['panel-story','Dit is een offline test, geen echte inzending.']])fill(p,id,value);submit(p);assert(p.d.getElementById('form-error').textContent,'Missing panel photo accepted');selectImage(p,'panel-photos');submit(p);submit(p);assert(p.d.querySelector('.success-panel .moderation-note'),'Panel lacks moderation explanation');ensureReadOnly(p);p.close();
 // Verify the existing public endpoints request approved records. No external I/O.
 const originalFetch=global.fetch;let publicChecks=0;
 try{for(const name of ['participants','sponsors','organisations','panels']){global.fetch=async url=>{assert.equal(new URL(url).searchParams.get('status'),'eq.approved',`${name}: public endpoint does not filter approval`);publicChecks++;return {ok:true,json:async()=>[]};};process.env.SUPABASE_URL='https://qa.invalid';process.env.SUPABASE_SERVICE_KEY='test-only';const handler=require(path.join(root,'../netlify/functions',name+'.js')).handler;const response=await handler({httpMethod:'GET',headers:{}});assert.equal(response.statusCode,200);}}finally{global.fetch=originalFetch;}
 console.log(JSON.stringify({routeChecks,languages:6,searchChecks:6,registrationRoles:4,logoFlows:2,panelFlow:1,publicApprovalFilters:publicChecks,shuffleAndFilter:'passed',privateEnquiryIsolation:'passed',roleChange:'passed',previewMutations:0}));
})().catch(error=>{console.error(error.message);process.exit(1);});
