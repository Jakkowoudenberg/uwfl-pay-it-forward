'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const root=path.resolve(__dirname,'../dist');
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+kf1sAAAAASUVORK5CYII=';
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
async function create(lang='nl'){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const dom=new JSDOM(html,{url:'https://release.invalid/#home',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,calls=[];
 w.localStorage.setItem('uwfl_preview_lang',lang);w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.URL.createObjectURL=()=> 'blob:https://release.invalid/fictional';w.URL.revokeObjectURL=()=>{};
 w.Image=class{constructor(){this.naturalWidth=1;this.naturalHeight=1;}async decode(){}};
 w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){}});w.HTMLCanvasElement.prototype.toDataURL=()=>png;
 let hold;
 w.fetch=async(url,options={})=>{
  const name=new URL(url,w.location.href).pathname.split('/').pop();const data=options.body?JSON.parse(options.body):null;calls.push({name,data,method:options.method});
  if(options.method==='GET')return {ok:true,json:async()=>[]};
  assert(['upload-photo','register','panel-lookup','panel-photo','panel-submit','org-logo','sponsor-logo','org-submit','sponsor-submit','contact-submit'].includes(name),'Unexpected write');
  if(data.email)assert(data.email.endsWith('@example.invalid'));
  if(name==='panel-lookup'&&data.email==='wrong@example.invalid')return {ok:false,json:async()=>({ok:false,error:'credentials_mismatch'})};
  if(hold&&name===hold.name)await hold.promise;
  const result=['upload-photo','panel-photo','org-logo','sponsor-logo'].includes(name)?{url:'uwfl-pending://fixture/'+name}:name==='panel-lookup'?{ok:true,name:'Fictional maker',country:'NL',participant_number:1234}:{ok:true,id:999,participant_number:name==='register'?1234:undefined,notification:'accepted'};
  return {ok:true,json:async()=>result};
 };
 for(const element of [...w.document.querySelectorAll('script[src]')])w.eval(fs.readFileSync(path.join(root,element.getAttribute('src').split('?')[0]),'utf8'));
 await tick();await tick();
 return {w,d:w.document,calls,close:()=>w.close(),hold(name){let release;hold={name,promise:new Promise(r=>release=r)};return()=>{hold=null;release();};}};
}
async function nav(x,route){x.w.location.hash=route;await tick();await tick();}
function fill(x,id,value){const el=x.d.getElementById(id);assert(el,id);el.value=value;el.dispatchEvent(new x.w.Event('input',{bubbles:true}));}
function photo(x,id){const el=x.d.getElementById(id);Object.defineProperty(el,'files',{value:[new x.w.File([new Uint8Array(12)],'fictional.png',{type:'image/png'})],configurable:true});el.dispatchEvent(new x.w.Event('change',{bubbles:true}));}
async function submit(x){const form=x.d.getElementById('work-form');assert(form.checkValidity(),'Invalid fixture');form.querySelector('[type="submit"]').click();for(let i=0;i<5;i++)await tick();}
(async()=>{
 for(const lang of ['nl','en','de','fr','es','it']){
  const x=await create(lang);assert(x.w.UWFL_LIVE);assert(!/preview/i.test(x.d.title));
  for(const [key,values] of Object.entries(x.w.UWFL_UI))assert(values.length===6&&values.every(v=>v!==undefined),key);
  assert.equal(x.d.querySelector('[data-stat="media"]').textContent,'0','Live media are counted');
  await nav(x,'join/maker');
  for(const [key,value] of [['name','Fictional Maker'],['email','maker@example.invalid'],['country','NL'],['phone','+31000000000'],['trade','Wood craft']])fill(x,key,value);
  await submit(x);fill(x,'story','Fictional release story');photo(x,'join-photo');await submit(x);x.d.getElementById('agree').checked=true;
  const release=x.hold('register');x.d.querySelector('[type="submit"]').click();await tick();assert(x.d.querySelector('[type="submit"]').disabled);x.d.querySelector('[type="submit"]').click();release();for(let i=0;i<7;i++)await tick();
  assert(x.d.querySelector('.success-panel'));assert(x.d.querySelector('.registration-number').textContent.includes('1234'));
  const registrations=x.calls.filter(c=>c.name==='register');assert.equal(registrations.length,1,'Double click submitted twice');assert.equal(registrations[0].data.type,'Maker');assert.equal(registrations[0].data.bericht,'Fictional release story');assert(registrations[0].data.photo_url);
  await nav(x,'upload');assert(!x.d.querySelector('[data-action="sample-upload"]'),'Sample button remains live');
  fill(x,'participant-number','1234');fill(x,'panel-email','wrong@example.invalid');await submit(x);assert(!x.d.getElementById('form-error').hidden);assert(!x.d.getElementById('artwork-name'));
  fill(x,'panel-email','maker@example.invalid');await submit(x);assert(x.d.getElementById('artwork-name'));
  fill(x,'artwork-name','Fictional panel');fill(x,'wood-species','Oak');fill(x,'pattern','Inlay');fill(x,'panel-materials','Natural oil');fill(x,'shipping-country','CA');photo(x,'panel-photos');await submit(x);
  fill(x,'panel-story','Fictional panel story');fill(x,'panel-why','Share skills');fill(x,'panel-meaning','Connection');await submit(x);await submit(x);assert(x.d.querySelector('.success-panel'));
  const panel=x.calls.find(c=>c.name==='panel-submit').data;assert.equal(panel.shipping_country,'CA');assert.equal(panel.why,'Share skills');assert.equal(panel.meaning,'Connection');assert.equal(panel.materials,'Natural oil');assert.equal(panel.story,'Fictional panel story');assert.equal(panel.photos.length,1);
  for(const kind of ['sponsor','organisation','media-partner']){
   await nav(x,kind);fill(x,'contact-company','Fictional '+kind);fill(x,'contact-email','partner@example.invalid');fill(x,'profile-country','NL');fill(x,'why','Share skills');fill(x,'what','Help people');photo(x,'sponsor-logo');await submit(x);assert(x.d.querySelector('.success-panel'),kind);
  }
  const media=x.calls.filter(c=>c.name==='org-submit').at(-1).data;assert.equal(media.category,'media');assert.equal(media.role,'Share skills\n\nHelp people');
  await nav(x,'contact/support');fill(x,'contact-name','Fictional enquiry');fill(x,'contact-email','contact@example.invalid');fill(x,'contact-message','Private fictional message');await submit(x);assert(x.d.querySelector('.success-panel'));assert.equal(x.calls.filter(c=>c.name==='contact-submit').at(-1).data.context,'support');
  await nav(x,'home');assert.equal(x.d.querySelector('[data-stat="makers"]').textContent,'0','Submission became public without approval');
  x.close();
 }
 console.log('Production UI passed in six languages: real payload mapping, private images, participant lookup, full panel story, all partner roles, contacts, success states and double-click protection. All networking mocked.');
})().catch(error=>{console.error(error);process.exitCode=1;});
