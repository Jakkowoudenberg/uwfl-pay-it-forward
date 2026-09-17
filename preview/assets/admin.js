/* Authenticated management of the existing app. No password or private record is persisted.
   ?demo=1 uses fictional, in-memory records and never calls the production API. */
(()=>{
'use strict';
const LIVE=window.UWFL_LIVE===true;
const API=LIVE?'/.netlify/functions/':'https://app.unitedwoodfloorlayers.com/.netlify/functions/';
const groups={
 registrations:{label:'adminRegistrations',read:'admin-pending',write:'approve'},
 panels:{label:'adminPanels',read:'admin-panels-pending',write:'panel-approve'},
 sponsors:{label:'audSponsors',read:'admin-sponsors-pending',write:'sponsor-approve'},
 organisations:{label:'audOrganisations',read:'admin-orgs-pending',write:'org-approve'}
};
const demo=new URLSearchParams(location.search).get('demo')==='1';
if(LIVE&&!demo){groups.organisations.label='adminOrgMedia';groups.messages={label:'adminMessages',read:'admin-messages-pending',write:'message-archive'};groups.mail={label:'adminMailStatus',read:'admin-mail-status',readonly:true};}
const locales=window.UWFL_LOCALES,main=document.getElementById('admin-main'),dialog=document.getElementById('admin-dialog');
let lang='en',password='',authenticated=demo,busy=false,epoch=0,current='registrations',query='',message='',error='',rejectTarget=null;
let queues={};
const controllers=new Set();
try{const saved=localStorage.getItem('uwfl_preview_lang'),detected=(navigator.language||'en').slice(0,2);lang=locales.includes(saved)?saved:(locales.includes(detected)?detected:'en');}catch{}
const localeIndex=language=>locales.indexOf(language);
const t=key=>window.UWFL_LOCALE_OVERRIDES?.[lang]?.[key]??window.UWFL_UI[key]?.[localeIndex(lang)]??window.UWFL_UI[key]?.[localeIndex('en')]??key;
const languageName=language=>({nl:'Nederlands',en:'English',de:'Deutsch',fr:'Français',es:'Español',it:'Italiano',pt:'Português',pl:'Polski'}[language]||language.toUpperCase());
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validId=value=>/^(?:[0-9]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(String(value??''));
const title=(group,row)=>group==='mail'?`${row.kind} #${row.record_id} · ${row.state}`:String(group==='panels'?(row.artwork_name||`#${row.participant_number||row.id}`):(group==='sponsors'?row.company:row.name)||`#${row.id}`);
const safeUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}};
const demoRows={
 registrations:[{id:1001,name:'Fictieve deelnemer / Demo participant',company:'UWFL demo',country:'Netherlands',type:'Contributor',message:'Fictief voorbeeld. Ik help met vervoer en geef mijn kennis door. / Fictional example: helping with transport and sharing skills.'}],
 panels:[{id:1002,participant_number:9999,first_name:'Demo',last_name:'Maker',artwork_name:'Together — fictief voorbeeld',country_made:'Canada',wood_species:'Oak / eiken',pattern:'Geometric inlay / geometrisch inlegwerk',story:'Dit is een fictief paneel om het beheer te bekijken.\nThis is a fictional panel for reviewing the management interface.',photos:['assets/admin-demo-panel.svg']}],
 sponsors:[{id:1003,company:'Fictieve sponsor / Demo sponsor',country:'Germany',logo_url:'assets/admin-demo-panel.svg',why:'Fictief voorbeeld: vakkennis doorgeven. / Fictional example: sharing craft.',what:'Materialen / materials'}],
 organisations:[{id:1004,name:'Fictieve vakorganisatie / Demo association',country:'France',logo_url:'assets/admin-demo-panel.svg',role:'Fictief voorbeeld: makers verbinden. / Fictional example: connecting makers.'}]
};
function resetQueues(){queues=Object.fromEntries(Object.keys(groups).map(g=>[g,{rows:[],state:'loading'}]));}
resetQueues();
async function request(group,action='',id='',key=password){
 if(!groups[group]||!['','approve','reject'].includes(action)||(action&&!validId(id)))throw new Error('Invalid request');
 if(demo){
  if(action){demoRows[group]=demoRows[group].filter(row=>String(row.id)!==String(id));return {ok:true};}
  return demoRows[group].map(row=>({...row}));
 }
 if(!key)throw new Error('Unauthenticated');
 const controller=new AbortController();controllers.add(controller);
 const timer=setTimeout(()=>controller.abort(),20000);
 try{
  const endpoint=action?`${groups[group].write}?id=${encodeURIComponent(id)}&action=${action}`:groups[group].read;
  const response=await fetch(API+endpoint,{method:action?'POST':'GET',headers:{'X-Admin-Key':key},cache:'no-store',credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});
  if(response.status===401){const e=new Error('Unauthorized');e.unauthorized=true;throw e;}
  const data=await response.json();
  if(!response.ok){const error=new Error('Request failed');error.code=data?.error;throw error;}
  if(action){if(data?.ok!==true)throw new Error('Unconfirmed');}
  else if(!Array.isArray(data)||data.some(row=>!row||typeof row!=='object'||!validId(row.id)))throw new Error('Invalid queue');
  return data;
 }finally{clearTimeout(timer);controllers.delete(controller);}
}
function endSession(reason=''){
 epoch++;password='';authenticated=false;busy=false;query='';message='';error=reason;rejectTarget=null;
 for(const controller of controllers)controller.abort();controllers.clear();resetQueues();
 if(dialog.open)dialog.close();dialog.innerHTML='';render();
}
function header(){
 document.documentElement.lang=lang;document.title=t('adminTitle')+' · United Woodfloor Layers';
 document.getElementById('admin-header').innerHTML=`<div class="shell header-inner"><a class="brand" href="./#home" aria-label="United Woodfloor Layers — Pay It Forward"><img src="assets/uwfl-logo.jpg" alt="" width="68" height="68"><span class="brand-name">United <span>Woodfloor Layers</span><small>PAY IT FORWARD</small></span></a><div class="header-tools"><select id="admin-language" aria-label="${t('language')}" ${busy?'disabled':''}>${locales.map(l=>`<option value="${l}" ${l===lang?'selected':''}>${languageName(l)}</option>`).join('')}</select>${authenticated?`<button class="button outline small" type="button" data-admin="logout">${t('adminLogout')}</button>`:''}</div></div>`;
}
function render(){
 header();
 if(!authenticated){
  main.innerHTML=`<div class="admin-shell"><section class="admin-login"><h1>${t('adminTitle')}</h1><p>${t('adminLoginIntro')}</p><form id="admin-login-form"><div class="field"><label for="admin-password">${t('adminPassword')}</label><input id="admin-password" type="password" autocomplete="current-password" required ${busy?'disabled':''} aria-describedby="admin-login-error"></div><div id="admin-login-error" class="admin-error" role="alert" ${error?'':'hidden'}>${error?t(error):''}</div><button class="button" type="submit" ${busy?'disabled':''}>${t(busy?'adminWorking':'adminLogin')}</button></form><a class="admin-demo-link" href="admin.html?demo=1">${t('adminDemoLink')}</a></section><a class="admin-back" href="./#home">← ${t('adminBack')}</a></div>`;
  return;
 }
 main.innerHTML=`<div class="admin-shell"><div class="admin-top"><div><span class="admin-badge">${t(demo?'adminDemo':'adminCurrentApp')}</span><h1>${t('adminTitle')}</h1><p>${t('adminIntro')}</p></div><button type="button" class="button outline" data-admin="refresh" ${busy?'disabled':''}>${t('adminRefresh')}</button></div><aside class="admin-note ${demo?'demo':''}">${t(demo?'adminDemoNote':'adminLiveNote')}${demo?` <a class="admin-demo-link" href="admin.html">${t('adminLiveLink')}</a>`:''}</aside><div class="admin-message" role="status" ${message||busy?'':'hidden'}>${busy?t('adminWorking'):(message?t(message):'')}</div><div class="admin-error" role="alert" ${error?'':'hidden'}>${error?t(error):''}</div><nav class="admin-tabs" aria-label="${t('adminTitle')}">${Object.entries(groups).map(([g,config])=>`<button type="button" class="admin-tab" data-group="${g}" aria-pressed="${current===g}" ${busy?'disabled':''}><span>${t(config.label)}</span><strong>${queues[g].state==='ready'?queues[g].rows.length:'—'}</strong></button>`).join('')}</nav><section aria-labelledby="admin-list-heading" aria-busy="${busy}"><div class="admin-list-top"><h2 id="admin-list-heading">${t(groups[current].label)}</h2><div class="field"><label for="admin-search">${t('adminSearch')}</label><input type="search" id="admin-search" value="${esc(query)}" ${busy?'disabled':''}></div></div><div id="admin-list"></div></section><a class="admin-back" href="./#home">← ${t('adminBack')}</a></div>`;
 renderList();
}
function field(label,value){return value===undefined||value===null||String(value).trim()===''?'':`<dt>${t(label)}</dt><dd>${esc(value)}</dd>`;}
function section(label,value){return typeof value==='string'&&value.trim()?`<section class="panel-story-section"><h3>${t(label)}</h3><p>${esc(value)}</p></section>`:'';}
function images(group,row){
 const source=group==='panels'?(Array.isArray(row.photos)?row.photos:[]):[row.logo_url||row.photo_url];
 const urls=source.map(value=>demo&&value==='assets/admin-demo-panel.svg'?value:safeUrl(value)).filter(Boolean);
 if(!urls.length)return `<p class="admin-subtle">${t(group==='registrations'?'adminRegistrationPhoto':'adminMissingImage')}</p>`;
 return `<div class="admin-images">${urls.map(url=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer"><img src="${esc(url)}" alt="${esc(title(group,row))}" loading="lazy" referrerpolicy="no-referrer"></a>`).join('')}</div>`;
}
function details(group,row){
 if(group==='mail')return `<p>${t('adminMailPending')}</p><dl class="review-list">${field('adminType',row.kind)}${field('adminMadeOn',row.created_at)}${field('adminMailStatus',row.state)}</dl>`;
 let content=group==='messages'?'':images(group,row);
 content+=`<dl class="review-list">${field('adminCountry',row.country||row.country_made)}${field('adminCompany',row.company)}${field('participantNumber',row.participant_number)}${field('adminType',row.type||row.role)}${group==='panels'?field('adminMaker',[row.first_name,row.last_name].filter(Boolean).join(' '))+field('adminPlace',row.place_made)+field('adminMadeOn',row.production_date)+field('adminNationality',row.nationality)+field('adminShippingCountry',row.shipping_country):''}</dl>`;
 if(group==='panels'){
  content+=window.UWFL_PANEL.sections(row).map(part=>section(part.label,part.value)).join('');
  const craft=window.UWFL_PANEL.craft(row);if(craft.length)content+=`<h3>${t('panelCraft')}</h3><dl class="review-list">${craft.map(part=>field(part.label,part.value)).join('')}</dl>`;
 }else if(group==='registrations'||group==='messages')content+=section(group==='messages'?'message':'yourStory',row.message);
 else if(group==='sponsors')content+=section('adminWhy',row.why)+section('adminWhat',row.what);
 const contacts=[...new Set([row.email,row.phone,row.submitter_email,row.contact_email,row.contact_phone,row.contact_website])].filter(value=>typeof value==='string'&&value.trim());
 if(contacts.length)content+=section('adminContact',contacts.join('\n'));
 if(group==='panels'&&!demo)content+=`<p class="admin-subtle">${t('adminMailNote')}</p>`;
 return content+`<div class="admin-actions"><button type="button" class="button" data-admin="approve" data-id="${esc(row.id)}" ${busy?'disabled':''}>${t(group==='messages'?'adminHandled':'adminApprove')}</button><button type="button" class="button reject" data-admin="reject" data-id="${esc(row.id)}" ${busy?'disabled':''}>${t('adminReject')}</button></div>`;
}
function renderList(){
 const list=document.getElementById('admin-list');if(!list)return;
 const queue=queues[current];
 if(queue.state!=='ready'){list.innerHTML=`<p class="${queue.state==='error'?'admin-error':'admin-empty'}">${t(queue.state==='error'?'adminLoadError':'adminLoading')}</p>`;return;}
 const rows=queue.rows.filter(row=>Object.values(row).filter(value=>['string','number'].includes(typeof value)).join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 list.innerHTML=rows.length?rows.map(row=>`<details class="admin-review" data-record="${esc(row.id)}"><summary><div><strong>${esc(title(current,row))}</strong><small>${esc([row.country||row.country_made,row.type||row.role].filter(Boolean).join(' · '))}</small></div><span>${t('adminDetails')}</span></summary><div class="admin-review-body">${details(current,row)}</div></details>`).join(''):`<p class="admin-empty">${t(queue.rows.length?'adminNoMatches':'adminEmpty')}</p>`;
 list.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const note=document.createElement('p');note.className='admin-image-error';note.textContent=t('adminMissingImage');img.closest('a').replaceWith(note);},{once:true}));
}
async function loadQueue(group,session){
 try{const rows=await request(group);if(session===epoch&&authenticated)queues[group]={rows,state:'ready'};}
 catch(e){if(session!==epoch)return;if(e.unauthorized){endSession('adminSessionExpired');return;}queues[group]={rows:[],state:'error'};}
}
async function refresh(){
 if(busy||!authenticated)return;
 const session=epoch;busy=true;error='';message='';resetQueues();render();
 await Promise.allSettled(Object.keys(groups).map(group=>loadQueue(group,session)));
 if(session!==epoch||!authenticated)return;busy=false;render();
}
async function signIn(event){
 event.preventDefault();if(busy)return;
 const input=document.getElementById('admin-password');let candidate=input.value;if(!candidate)return;
 input.value='';busy=true;error='';const session=++epoch;render();
 try{
  const rows=await request('registrations','','',candidate);
  if(session!==epoch)return;
  password=candidate;candidate='';authenticated=true;queues.registrations={rows,state:'ready'};render();
  await Promise.allSettled(Object.keys(groups).filter(g=>g!=='registrations').map(group=>loadQueue(group,session)));
 }catch(e){if(session===epoch)error=e.unauthorized?'adminBadPassword':'adminLoginError';}
 finally{candidate='';if(session===epoch){busy=false;render();if(!authenticated)document.getElementById('admin-password')?.focus();}}
}
function confirmReject(id){
 const row=queues[current].rows.find(row=>String(row.id)===id);if(busy||!row)return;
 rejectTarget={group:current,id};
 dialog.innerHTML=`<h2 id="admin-dialog-title">${t('adminRejectTitle')}</h2><p><strong>${esc(title(current,row))}</strong></p><p>${t(demo?'adminDemoNote':'adminRejectNote')}</p><div class="admin-actions"><button type="button" class="button outline" data-admin="cancel" autofocus>${t('adminCancel')}</button><button type="button" class="button reject" data-admin="confirm-reject">${t('adminConfirmReject')}</button></div>`;
 dialog.showModal();
}
async function decide(group,id,action){
 if(busy||!authenticated||!validId(id)||!queues[group]?.rows.some(row=>String(row.id)===id))return;
 const session=epoch;busy=true;error='';message='';render();
 try{
  // Avoid knowingly acting on an item another reviewer already handled.
  const before=await request(group);
  if(session!==epoch||!authenticated)return;
  queues[group]={rows:before,state:'ready'};
  if(!before.some(row=>String(row.id)===id)){message='adminGone';return;}
  const decision=await request(group,action,id);
  if(session!==epoch||!authenticated)return;
  const after=await request(group);
  if(session!==epoch||!authenticated)return;
  queues[group]={rows:after,state:'ready'};
  if(after.some(row=>String(row.id)===id))throw new Error('Still pending');
  message=action==='approve'?(decision.notification&& !['accepted','previously_requested'].includes(decision.notification)?'adminMailUnknown':'adminApproved'):'adminRejected';
 }catch(e){
  if(session!==epoch)return;
  if(e.unauthorized){endSession('adminSessionExpired');return;}
  // No automatic retry: an interrupted panel approval may already have sent mail.
  if(e.code==='maker_pending'||e.code==='image_required'){error=e.code==='maker_pending'?'adminMakerPending':'adminImageRequired';}else{queues[group]={rows:[],state:'error'};error='adminUnconfirmed';}
 }finally{if(session===epoch&&authenticated){busy=false;render();document.querySelector('.admin-message:not([hidden]),.admin-error:not([hidden])')?.scrollIntoView({block:'nearest'});}}
}
document.addEventListener('submit',event=>{if(event.target.id==='admin-login-form')signIn(event);});
document.addEventListener('input',event=>{if(event.target.id==='admin-search'){query=event.target.value;renderList();}});
document.addEventListener('change',event=>{if(event.target.id==='admin-language'&&!busy&&locales.includes(event.target.value)){lang=event.target.value;try{localStorage.setItem('uwfl_preview_lang',lang);}catch{}render();}});
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button||button.disabled)return;
 if(button.dataset.group&&!busy){current=button.dataset.group;query='';message='';error='';render();return;}
 const action=button.dataset.admin;
 if(action==='logout'){endSession();return;}
 if(action==='cancel'){rejectTarget=null;dialog.close();dialog.innerHTML='';return;}
 if(busy)return;
 if(action==='refresh')refresh();
 if(action==='approve')decide(current,button.dataset.id,'approve');
 if(action==='reject')confirmReject(button.dataset.id);
 if(action==='confirm-reject'&&rejectTarget){const target=rejectTarget;rejectTarget=null;dialog.close();dialog.innerHTML='';decide(target.group,target.id,'reject');}
});
dialog.addEventListener('cancel',()=>{rejectTarget=null;});
dialog.addEventListener('close',()=>{rejectTarget=null;dialog.innerHTML='';});
window.addEventListener('pagehide',()=>endSession());
render();if(demo)refresh();
})();
