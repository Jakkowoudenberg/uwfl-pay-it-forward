'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=name=>fs.readFileSync(path.join(__dirname,'../preview/assets',name),'utf8');
function callback(hash,language='nl',storageFails=false){
 const elements=Object.fromEntries(['title','again','message','continue'].map(id=>[id,{hidden:false,textContent:'',addEventListener(type,fn){this.click=fn;}}]));
 const saved={},history=[],destinations=[];
 const context={URLSearchParams,Date,navigator:{language},location:{hash,pathname:'/participant-login.html',replace:url=>destinations.push(url)},history:{replaceState:(_,__,url)=>history.push(url)},document:{documentElement:{},getElementById:id=>elements[id]},sessionStorage:{setItem(k,v){if(storageFails)throw Error('Storage disabled');saved[k]=v;}}};
 vm.runInNewContext(source('participant-login.js'),context);
 return {elements,saved,history,destinations};
}
(async()=>{
 const hash='#access_token=fictional.access.token&refresh_token=never-store-this&expires_at='+Math.floor(Date.now()/1000+3600);
 for(const language of ['nl','en','de','fr','es','it']){
  const c=callback(hash,language);assert.deepEqual(c.history,['/participant-login.html']);
  assert.equal(c.elements.continue.hidden,false);assert.equal(Object.keys(c.saved).length,0,'No login before explicit Continue');
  c.elements.continue.click();assert.equal(c.saved.uwfl_participant_access,'fictional.access.token');
  assert.deepEqual(c.destinations,['/#upload']);assert(!JSON.stringify(c.saved).includes('never-store-this'));
 }
 assert(callback('#error=access_denied').elements.continue.hidden);
 assert(callback('#access_token=fictional.access.token&expires_at=1').elements.continue.hidden);
 const unavailable=callback(hash,'nl',true);unavailable.elements.continue.click();assert.equal(unavailable.destinations.length,0);assert(unavailable.elements.message.textContent.includes('browser'));
 let stored='fictional.access.token',failure='',calls=[];
 const window={UWFL_UI:{},UWFL_PANEL:{fromDraft:()=>({})}};
 const context={window,sessionStorage:{getItem:()=>stored,removeItem:()=>{stored='';}},WeakMap,Map,Promise,AbortController,setTimeout,clearTimeout,crypto:{randomUUID:()=> 'fictional-id'},fetch:async(url,options)=>{
  const body=JSON.parse(options.body);calls.push({url,body});
  return {ok:!failure,json:async()=>failure?{error:failure}:{ok:true}};
 }};
 vm.runInNewContext(source('production.js'),context);
 const draft={'participant-number':'5','panel-email':'maker@example.invalid'};
 await window.UWFL_SUBMIT.lookup(draft);assert.equal(calls[0].body.access_token,stored);
 await window.UWFL_SUBMIT.login(draft);assert(!('access_token'in calls[1].body));
 await window.UWFL_SUBMIT.contact({'contact-email':'maker@example.invalid'},'contact','nl');assert(!('access_token'in calls[2].body));
 failure='login_required';await assert.rejects(()=>window.UWFL_SUBMIT.lookup(draft));
 assert.equal(window.UWFL_LOGIN.active(),false);assert.equal(stored,'');
 console.log('Login browser-logic checks passed: six callback languages, explicit confirmation, fragment cleanup, expiry, no refresh-token persistence, storage errors, protected-request token scope and expired-login cleanup.');
})().catch(e=>{console.error(e);process.exitCode=1;});
