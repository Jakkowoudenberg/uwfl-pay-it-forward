/* Offline behaviour checks. All people and organisations below are fictional.
   QA-only dependency: JSDOM_PATH=/absolute/path/to/jsdom node scripts/check-preview.cjs
   No requests are made to production and this script is not part of the deployed preview. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const root=path.resolve(__dirname,'../preview');
const code=['content.js','translations.js','experience.js','purpose.js','community.js','shipping-policy.js','regional.js','panel-story.js','app.js'].map(n=>fs.readFileSync(path.join(root,'assets',n),'utf8'));
const fixtures={
 participants:[1,2,3,4].map((n)=>({name:`Fictieve Testdeelnemer ${n}`,company:'QA voorbeeld',country:n%2?'NL':'US',type:['Maker','Contributor','Participant','Initiator'][n-1],message:'Fictief verhaal uitsluitend voor de offline test.',photo_url:'https://example.invalid/photo.jpg',participant_number:n})),
 sponsors:[1,2,3].map(n=>({company:`Fictieve Testsponsor ${n}`,country:'Nederland',logo_url:'https://example.invalid/logo.jpg',why:'Test',what:'Test'})),
 organisations:[1,2,3].map(n=>({name:`Fictieve Testorganisatie ${n}`,country:'Netherlands',logo_url:'https://example.invalid/logo.jpg',role:'Fictieve vereniging'})),
 panels:[1,2,3].map(n=>({id:n,artwork_name:`Fictief Testpaneel ${n}`,participant_number:n,first_name:'Fictief',last_name:'Voorbeeld',story:'Alleen testmateriaal.\nEigen woorden blijven behouden.',why:n===1?'Fictieve motivatie.':'',meaning:n===1?'Een fictieve betekenis.':'',materials:n===1?'<img src=x onerror=alert(1)> moet tekst blijven.':'',photos:['https://example.invalid/panel.jpg'],wood_species:'Eiken',pattern:'Test'}))
};
const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
async function create(lang='nl',random=0,failedSources=[]){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://preview.invalid/#home',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,requests=[];w.localStorage.setItem('uwfl_preview_lang',lang);w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.URL.createObjectURL=()=>`blob:https://preview.invalid/qa`;w.URL.revokeObjectURL=()=>{};w.Math.random=()=>random;
 w.fetch=async(url,options)=>{requests.push({url,method:options?.method});const key=new URL(url).pathname.split('/').pop();assert(key in fixtures,'Unexpected endpoint');if(failedSources.includes(key))return {ok:false};return {ok:true,json:async()=>JSON.parse(JSON.stringify(fixtures[key]))};};
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
 const routes=['home','makers','visitors','help','about','partners','sponsor','organisations','organisation','media-partner','community','community?group=makers&country=NL','community?group=contributors','community?group=media','gallery','gallery/1','read/project','read/press','read/initiator','read/privacy','read/expo','read/kickoff','read/news','read/kunstwerk','read/regels','resources','drawing','panel','idea','join','join/maker','join/participant','join/contributor','join/student','upload','contact','contact/support','contact/organisation-support','contact/media'];
 for(const lang of ['nl','en','de','fr','es','it']){
  const x=await create(lang);
  for(const [key,values] of Object.entries(x.w.UWFL_UI))assert(values.length===6&&values.every(v=>v!==undefined&&v!==''),`Incomplete translation: ${key}`);
  for(const route of routes){await nav(x,route);assert.equal(x.d.querySelectorAll('main h1').length,1,`${lang}/${route}: heading`);assert(!/undefined|NaN|\[object Object\]/.test(x.d.querySelector('main').textContent),`${lang}/${route}: invalid content`);routeChecks++;}
  await nav(x,'home');assert.equal(x.d.querySelectorAll('.artwork-journey li').length,4);assert(x.d.querySelector('[data-phase="gather"]'));await nav(x,'read/expo?region=eu');assert(x.d.querySelector('[data-region="eu"]').open);assert.equal(x.d.querySelectorAll('.region-card').length,3);assert(x.d.querySelector('.private-delivery'));
  await nav(x,'read/privacy');const first=x.d.querySelector('.reader p').textContent;assert(!/—.*—/.test(first),`${lang}: optional photo wording remains`);assert(x.d.querySelector('.moderation-note'),`${lang}: moderation notice`);
  await nav(x,'read/press');for(const a of x.d.querySelectorAll('a[download]'))assert(fs.existsSync(path.join(root,a.getAttribute('href'))),`Missing press file ${a.getAttribute('href')}`);
  await nav(x,'home');x.d.querySelector('.audience-grid a[href="#help"]').click();await pause();await pause();
  assert.equal(x.w.location.hash,'#help','Contributor entrance did not open its own page');
  assert.equal(x.d.querySelector('#audience-nav [aria-current="page"]').getAttribute('href'),'#help');
  x.d.querySelector('.help-tasks a[href="#join/contributor"]').click();await pause();await pause();
  assert(x.d.getElementById('name')&&!x.d.getElementById('trade'),'Contributor entrance opened maker registration');
  assert.equal(x.d.querySelector('.chosen-role strong').textContent,x.w.UWFL_CONTENT.join[lang].contrib_title);
  assert.equal(x.d.querySelector('#audience-nav [aria-current="page"]').getAttribute('href'),'#help');
  ensureReadOnly(x);x.close();
 }
 const x=await create('nl');
 await nav(x,'resources');
 for(const [term,target] of [['verzenden','#read/expo'],['hoe verstuur ik mijn paneel','#read/expo'],['kosten','#makers'],['foto','#join'],['helpen','#help'],['bijdragers','#help'],['bouwtekening','#drawing']]){fill(x,'topic-search',term);assert(x.d.querySelector(`#topic-results a[href="${target}"]`),`Search failed: ${term}`);}
 await nav(x,'community');
 const numbers=()=>[...x.d.querySelectorAll('[data-participant-number]')].map(e=>e.textContent);
 const firstOrder=numbers();assert.equal(firstOrder.length,4);assert.notDeepEqual(firstOrder,['#0001','#0002','#0003','#0004']);
 assert.equal(x.d.querySelectorAll('#people-grid .directory-card').length,10,'Approved supporters missing from combined directory');
 assert.equal(x.d.getElementById('people-country').options.length,3,'Equivalent country names counted separately');
 const sharedOrder=[...x.d.querySelectorAll('[data-profile-key]')].map(e=>e.dataset.profileKey);
 const group=x.d.getElementById('people-group');group.value='makers';group.dispatchEvent(new x.w.Event('change',{bubbles:true}));assert.deepEqual(numbers(),['#0001']);
 group.value='contributors';group.dispatchEvent(new x.w.Event('change',{bubbles:true}));assert.equal(numbers().length,3,'Non-maker roles were dropped');
 group.value='sponsors';group.dispatchEvent(new x.w.Event('change',{bubbles:true}));assert.equal(x.d.querySelectorAll('.directory-card').length,3);
 group.value='';group.dispatchEvent(new x.w.Event('change',{bubbles:true}));assert.deepEqual([...x.d.querySelectorAll('[data-profile-key]')].map(e=>e.dataset.profileKey),sharedOrder,'Filtering reshuffled the directory');
 await nav(x,'home');assert.equal(x.d.querySelector('[data-stat="countries"]').textContent,'2');assert.equal(x.d.querySelector('[data-stat="makers"]').textContent,'1');assert.equal(x.d.querySelector('[data-stat="contributors"]').textContent,'3');assert.equal(x.d.querySelector('[data-stat="sponsors"]').textContent,'3');assert.equal(x.d.querySelector('[data-stat="media"]').textContent,'—','Unknown media count presented as zero');
 const statsCountry=x.d.getElementById('stats-country');statsCountry.value='US';statsCountry.dispatchEvent(new x.w.Event('change',{bubbles:true}));assert.equal(x.d.querySelector('[data-stat="sponsors"]').textContent,'0');assert.equal(x.d.querySelector('[data-stat="countries"]').textContent,'2','Worldwide country count changed with a local filter');
 x.d.querySelector('[data-directory-group="contributors"]').click();await pause();await pause();assert.equal(x.d.getElementById('people-country').value,'US');assert.equal(x.d.getElementById('people-group').value,'contributors');assert.equal(numbers().length,2,'Summary link did not apply both filters');
 await nav(x,'community');assert.deepEqual([...x.d.querySelectorAll('[data-profile-key]')].map(e=>e.dataset.profileKey),sharedOrder,'Returning reshuffled the directory');

 fill(x,'people-search','Fictieve');assert.deepEqual(numbers(),firstOrder);
 const country=x.d.getElementById('people-country');country.value='NL';country.dispatchEvent(new x.w.Event('change',{bubbles:true}));assert.deepEqual(numbers(),firstOrder.filter(n=>['#0001','#0003'].includes(n)));country.value='';country.dispatchEvent(new x.w.Event('change',{bubbles:true}));assert.deepEqual(numbers(),firstOrder);
 for(const route of ['partners','organisations']){await nav(x,route);const order=[...x.d.querySelectorAll('.partner-card h3')].map(e=>e.textContent);await nav(x,'home');await nav(x,route);assert.deepEqual([...x.d.querySelectorAll('.partner-card h3')].map(e=>e.textContent),order);}
 await nav(x,'gallery');const galleryOrder=[...x.d.querySelectorAll('[data-panel-id]')].map(a=>a.dataset.panelId);const panelTitle=x.d.querySelector('.maker-card h3').textContent;x.d.querySelector('[data-panel-id]').click();await pause();await pause();assert.equal(x.d.querySelector('main h1').textContent,panelTitle,'Shuffled gallery opened the wrong artwork');x.d.querySelector('main a[href="#gallery"]').click();await pause();await pause();assert.deepEqual([...x.d.querySelectorAll('[data-panel-id]')].map(a=>a.dataset.panelId),galleryOrder,'Return to gallery failed or reshuffled panels');
 for(const panel of fixtures.panels){await nav(x,'gallery');const card=[...x.d.querySelectorAll('.maker-card')].find(el=>el.querySelector('h3').textContent===panel.artwork_name);card.querySelector('[data-panel-id]').click();await pause();await pause();assert.equal(x.d.querySelector('[data-story-field="story"] p').textContent,panel.story,'Existing maker text changed');assert.equal(x.d.querySelectorAll('[data-story-field="why"]').length,panel.why?1:0);assert.equal(x.d.querySelectorAll('[data-story-field="meaning"]').length,panel.meaning?1:0);if(panel.materials){const material=x.d.querySelector('[data-story-field="materials"]');assert.equal(material.textContent,panel.materials);assert.equal(material.querySelectorAll('img').length,0,'Materials interpreted as HTML');}}
 await nav(x,'contact/support');fill(x,'contact-email','qa-private@example.com');await nav(x,'sponsor');assert.equal(x.d.getElementById('contact-email').value,'','Private enquiry carried into a public profile');
 await nav(x,'join/participant');x.d.querySelector('[data-action="choose-role"]').click();await pause();await pause();assert(x.d.querySelector('.role-grid'),'Changing a preset role did not open the role selector');submit(x);assert(x.d.getElementById('name'),'Role selector did not return to details');x.d.querySelector('[data-action="choose-role"]').click();assert(x.d.querySelector('.role-grid'),'Changing role failed when already on #join');
 ensureReadOnly(x);x.close();
 const alternate=await create('nl',.999);await nav(alternate,'community');assert.notDeepEqual([...alternate.d.querySelectorAll('[data-participant-number]')].map(e=>e.textContent),firstOrder,'New visit did not use a new shuffle');alternate.close();
 for(const role of ['maker','participant','contributor','student']){
  const x=await create();await nav(x,'join/'+role);assert(x.d.getElementById('name'),'Preset role did not go to details');
  for(const [id,value] of [['name','Fictieve Testpersoon'],['email','qa@example.com'],['country','NL'],['phone','+31000000000']])fill(x,id,value);
  if(role==='maker')fill(x,'trade','Houtbewerker');submit(x);fill(x,'story','Fictieve test: ik wil drie mensen helpen.');submit(x);
  assert(x.d.getElementById('form-error').textContent.length,'Missing photo accepted');assert(x.d.getElementById('join-photo'),'Missing photo advanced the form');
  selectImage(x,'join-photo',5*1024*1024+1);assert(x.d.getElementById('form-error').textContent.includes('5'),'Oversized photo accepted');
  selectImage(x,'join-photo');submit(x);assert(x.d.getElementById('agree'),'Review step not reached');x.d.getElementById('agree').checked=true;submit(x);assert(x.d.querySelector('.success-panel .moderation-note'),'Missing review-before-publication message');assert(x.d.querySelector('.success-panel').textContent.includes('niets verstuurd'),'Preview receipt claims a real submission');
  await nav(x,'community');assert.equal(x.d.querySelectorAll('[data-participant-number]').length,4,'Submission appeared publicly');ensureReadOnly(x);x.close();
 }
 for(const kind of ['sponsor','organisation','media-partner']){
  const x=await create();await nav(x,kind);fill(x,'contact-company','Fictieve QA organisatie');fill(x,'why','Uitsluitend een offline test.');fill(x,'what','Testbijdrage.');submit(x);assert(x.d.getElementById('form-error').textContent.includes('Logo'),'Missing logo accepted');selectImage(x,'sponsor-logo');submit(x);assert(x.d.querySelector('.success-panel .moderation-note'),'Profile lacks moderation explanation');ensureReadOnly(x);x.close();
 }
 const p=await create();await nav(p,'upload');p.d.querySelector('[data-action="sample-upload"]').click();
 for(const [id,value] of [['artwork-name','Fictief testpaneel'],['wood-species','Eiken'],['pattern','Fictieve techniek'],['panel-materials','Resthout en olie.'],['shipping-country','NL']])fill(p,id,value);
 submit(p);assert(p.d.getElementById('form-error').textContent,'Missing panel photo accepted');selectImage(p,'panel-photos');
 for(const [country,region] of [['NL','eu'],['CA','americas'],['GB','other'],['NL','eu']]){const select=p.d.getElementById('shipping-country');select.value=country;select.dispatchEvent(new p.w.Event('change',{bubbles:true}));assert.equal(p.d.querySelector('[data-shipping-region]').dataset.shippingRegion,region);assert.equal(p.d.getElementById('artwork-name').value,'Fictief testpaneel');assert.equal(p.d.getElementById('panel-materials').value,'Resthout en olie.');}
 submit(p);assert(p.d.getElementById('panel-story'),'Separate story step missing');assert(p.d.getElementById('panel-story').required);assert(!p.d.getElementById('panel-why').required&&!p.d.getElementById('panel-meaning').required,'Additional personal questions must stay optional');
 fill(p,'panel-story','Dit is een offline test.\nGeen echte inzending.');fill(p,'panel-why','Een fictieve drijfveer.');fill(p,'panel-meaning','Een fictieve betekenis.');
 p.d.querySelector('[data-action="previous"]').click();assert.equal(p.d.getElementById('panel-materials').value,'Resthout en olie.');assert.equal(p.d.querySelectorAll('#panel-photos-preview img').length,1);submit(p);assert.equal(p.d.getElementById('panel-why').value,'Een fictieve drijfveer.');
 submit(p);assert(p.d.querySelector('.review-list').textContent.includes('Nederland'));assert.equal(p.d.querySelector('[data-shipping-region]').dataset.shippingRegion,'eu');
 for(const [key,value] of [['story','Dit is een offline test.\nGeen echte inzending.'],['why','Een fictieve drijfveer.'],['meaning','Een fictieve betekenis.'],['materials','Resthout en olie.'],['pattern','Fictieve techniek']])assert.equal(p.d.querySelector(`[data-story-field="${key}"]${key==='story'||key==='why'||key==='meaning'?' p':''}`).textContent,value);
 submit(p);assert(p.d.querySelector('.success-panel .moderation-note'),'Panel lacks moderation explanation');ensureReadOnly(p);p.close();
 const partial=await create('nl',0,['sponsors']);assert.equal(partial.d.querySelector('[data-stat="sponsors"]').textContent,'—','Failed sponsor load became a zero');assert.equal(partial.d.querySelector('[data-stat="makers"]').textContent,'1','One failed source hid available counts');assert.equal(partial.d.querySelector('[data-stat="countries"]').textContent,'—','Partial country count looked complete');assert(!partial.d.getElementById('stats-error').hidden);await nav(partial,'community?group=sponsors');assert(partial.d.getElementById('people-count').textContent.startsWith('—'));assert(partial.d.querySelector('[data-action="retry"]'));ensureReadOnly(partial);partial.close();
 const privateMedia=await create();await nav(privateMedia,'contact/media');fill(privateMedia,'contact-email','private-media@example.com');await nav(privateMedia,'media-partner');assert.equal(privateMedia.d.getElementById('contact-email').value,'','Press enquiry leaked into a public media draft');privateMedia.close();
 // Verify the existing public endpoints request approved records. No external I/O.
 const originalFetch=global.fetch;let publicChecks=0;
 try{for(const name of ['participants','sponsors','organisations','panels']){global.fetch=async url=>{assert.equal(new URL(url).searchParams.get('status'),'eq.approved',`${name}: public endpoint does not filter approval`);publicChecks++;return {ok:true,json:async()=>[]};};process.env.SUPABASE_URL='https://qa.invalid';process.env.SUPABASE_SERVICE_KEY='test-only';const handler=require(path.join(root,'../netlify/functions',name+'.js')).handler;const response=await handler({httpMethod:'GET',headers:{}});assert.equal(response.statusCode,200);}}finally{global.fetch=originalFetch;}
 console.log(JSON.stringify({routeChecks,languages:6,contributorEntrances:6,searchChecks:7,registrationRoles:4,logoFlows:3,panelFlow:1,panelStories:3,publicApprovalFilters:publicChecks,directoryCountsAndFilters:'passed',partialLoad:'passed',shuffleAndFilter:'passed',privateEnquiryIsolation:'passed',roleChange:'passed',previewMutations:0}));
})().catch(error=>{console.error(error.message);process.exit(1);});
