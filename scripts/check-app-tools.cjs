'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const root=path.resolve(__dirname,'../dist'),publicUrl='https://unitedwoodfloorlayers.com/';
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
async function create(lang='nl',options={}){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:options.url||publicUrl+'?fixture=private#home',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document,calls={share:[],copy:[],worker:[],fetch:[]};
 w.localStorage.setItem('uwfl_preview_lang',lang);w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.matchMedia=query=>({matches:query.includes('prefers-color-scheme')||!!options.standalone,addEventListener(){}});
 if(options.ua)Object.defineProperty(w.navigator,'userAgent',{value:options.ua});
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 Object.defineProperty(w.navigator,'serviceWorker',{value:{register:async(...args)=>{calls.worker.push(args);return {};}}});
 Object.defineProperty(w.navigator,'clipboard',{configurable:true,value:{writeText:async value=>{calls.copy.push(value);}}});
 w.navigator.share=async payload=>{calls.share.push(payload);};
 w.fetch=async(url,config={})=>{assert(!config.method||config.method==='GET','Tools must not submit data');calls.fetch.push(String(url));return {ok:true,json:async()=>[]};};
 for(const element of d.querySelectorAll('script[src]'))w.eval(fs.readFileSync(path.join(root,element.getAttribute('src').split('?')[0]),'utf8'));
 await tick();await tick();
 return {w,d,calls,close:()=>w.close(),share:()=>d.querySelector('[data-app-tool=share]'),install:()=>d.querySelector('[data-app-tool=install]')};
}
function promptEvent(x,result){const event=new x.w.Event('beforeinstallprompt',{cancelable:true});let count=0;event.prompt=()=>{count++;return result;};x.w.dispatchEvent(event);assert(event.defaultPrevented);return ()=>count;}
async function run(){
 for(const lang of ['nl','en','de','fr','es','it']){
  const x=await create(lang);
  assert.equal(x.d.querySelectorAll('[data-app-tool=share]').length,2);
  assert.equal(x.d.querySelectorAll('[data-app-tool=install]').length,2);
  assert(!/undefined|NaN/.test(x.d.querySelector('.app-quick-actions').textContent));
  assert.equal(x.w.getComputedStyle(x.d.body).backgroundColor,'rgb(255, 255, 255)');
  assert.equal(x.w.getComputedStyle(x.d.documentElement).colorScheme,'only light');
  assert.equal(x.d.querySelector('meta[name=theme-color]').content,'#ffffff');
  assert.equal(x.calls.worker.length,1);assert.equal(x.calls.worker[0][0],'/sw.js');assert.equal(x.calls.worker[0][1].updateViaCache,'none');
  x.share().click();await tick();assert.equal(x.calls.share.length,1);assert.equal(x.calls.share[0].url,publicUrl);assert(!JSON.stringify(x.calls.share).includes('private'));
  x.w.navigator.share=undefined;x.share().click();await tick();const dialog=x.d.querySelector('dialog');assert(dialog.open);
  assert.equal(dialog.querySelector('input').value,publicUrl);assert(dialog.querySelector('input').readOnly);
  dialog.querySelector('[data-copy-link]').click();await tick();assert.deepEqual(x.calls.copy,[publicUrl]);assert(dialog.querySelector('[role=status]').textContent);
  dialog.querySelector('.app-tools-close').click();assert(!x.d.querySelector('dialog'));assert.equal(x.d.activeElement,x.share());
  x.install().click();assert(x.d.querySelector('dialog ol li'));assert(!/undefined|NaN/.test(x.d.querySelector('dialog').textContent));
  x.close();
 }
 const x=await create('nl',{ua:'Mozilla/5.0 (Linux; Android 16) Chrome/140'});
 x.w.navigator.share=async()=>{throw new x.w.DOMException('cancelled','AbortError');};x.share().click();await tick();assert(!x.d.querySelector('dialog'),'Cancelling native sharing must not open a second share dialog');
 x.w.navigator.share=async()=>{throw new x.w.DOMException('denied','NotAllowedError');};x.share().click();await tick();assert(x.d.querySelector('dialog'));
 x.w.navigator.clipboard.writeText=async()=>{throw new Error('denied');};x.d.querySelector('[data-copy-link]').click();await tick();
 assert.equal(x.d.querySelector('#app-tools-url').selectionStart,0);assert.equal(x.d.querySelector('#app-tools-url').selectionEnd,publicUrl.length);assert(!x.d.querySelector('[role=status]').textContent.includes('gekopieerd'));
 x.d.querySelector('.app-tools-close').click();
 let finish;const count=promptEvent(x,new Promise(resolve=>{finish=resolve;}));x.install().click();x.d.querySelectorAll('[data-app-tool=install]')[1].click();assert.equal(count(),1);assert(x.install().disabled);
 finish({outcome:'dismissed'});await tick();assert(!x.install().disabled);assert.equal(x.install().textContent.trim(),'Download webapp');
 x.install().click();assert(x.d.querySelector('dialog').textContent.includes('startscherm'));x.d.querySelector('.app-tools-close').click();
 promptEvent(x,Promise.resolve({outcome:'accepted'}));x.install().click();await tick();assert(!x.install().disabled,'Accepting a prompt alone must not falsely claim a completed installation');
 x.w.dispatchEvent(new x.w.Event('appinstalled'));assert(x.install().disabled);assert.equal(x.install().textContent.trim(),'Webapp geïnstalleerd');
 x.w.location.hash='#panel';await tick();await tick();assert.equal(x.d.querySelectorAll('[data-app-tool=install]').length,1);assert(x.install().disabled);x.close();
 const ios=await create('nl',{ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit Safari'});ios.install().click();assert(ios.d.querySelector('dialog').textContent.includes('Zet op beginscherm'));assert(ios.d.querySelector('dialog').textContent.includes('Safari'));ios.close();
 const standalone=await create('en',{standalone:true});assert(standalone.install().disabled);standalone.install().click();assert(!standalone.d.querySelector('dialog'));standalone.close();
 const preview=await create('en',{url:'https://deploy-preview-4--unitedwoodfloorlayers.netlify.app/'});assert.equal(preview.calls.worker.length,0);preview.install().click();assert.equal(preview.d.querySelector('.app-tools-live-link').href,publicUrl);preview.close();
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json')));assert.equal(manifest.display,'standalone');assert.equal(manifest.background_color,'#ffffff');assert.equal(manifest.theme_color,'#ffffff');assert.equal(manifest.scope,'/');assert.equal(manifest.start_url,'/');for(const icon of manifest.icons)assert(fs.existsSync(path.join(root,icon.src)));
 const admin=new JSDOM(fs.readFileSync(path.join(root,'admin.html'),'utf8'));assert.equal(admin.window.getComputedStyle(admin.window.document.body).backgroundColor,'rgb(255, 255, 255)');assert.equal(admin.window.document.querySelector('meta[name=color-scheme]').content,'only light');admin.window.close();
 const handlers={},deleted=[],fetched=[];let claimed=0;
 const context={self:{addEventListener:(name,fn)=>{handlers[name]=fn;},skipWaiting:()=>{},clients:{claim:async()=>{claimed++;}}},caches:{keys:async()=>['uwfl-v12','pay-it-forward-v1','unrelated-cache'],delete:async name=>{deleted.push(name);}},fetch:async(...args)=>{fetched.push(args);return {ok:true};}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),context);handlers.install();let activation;handlers.activate({waitUntil:p=>{activation=p;}});await activation;assert.deepEqual(deleted,['uwfl-v12','pay-it-forward-v1']);assert.equal(claimed,1);
 let response;handlers.fetch({request:{mode:'navigate',method:'GET'},respondWith:p=>{response=p;}});assert((await response).ok);assert.equal(fetched[0][1].cache,'no-store');
 for(const request of [{mode:'cors',method:'GET',url:publicUrl+'.netlify/functions/admin-pending'},{mode:'navigate',method:'POST'}])handlers.fetch({request,respondWith:()=>{throw new Error('Do not intercept API calls or form submissions');}});
 console.log('App tools: six languages, white theme, native sharing/cancel/fallback, clipboard denial, installation/dismissal/duplicates, iOS, standalone, preview isolation and private-data-safe service worker passed.');
}
run().catch(error=>{console.error(error);process.exit(1);});
