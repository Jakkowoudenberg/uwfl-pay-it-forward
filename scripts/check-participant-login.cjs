'use strict';
const assert=require('node:assert/strict');
process.env.SUPABASE_URL='https://fictional.invalid';
process.env.SUPABASE_SERVICE_KEY='fictional-key';
process.env.RECAPTCHA_SECRET_KEY='fictional-captcha';
process.env.PARTICIPANT_EMAIL_LOGIN_READY='true';
const {participant}=require('../netlify/lib/participant');
const {requestLink}=require('../netlify/lib/participant-auth');
let row={name:'Fictional',status:'approved',email:'maker@example.invalid',participant_number:5,upload_without_email:true};
let user={id:'fictional-user',role:'authenticated',email:'maker@example.invalid',email_confirmed_at:'2026-01-01'},userStatus=200,mailStatus=200,requests=[];
const json=(value,status=200)=>new Response(JSON.stringify(value),{status});
global.fetch=async(input,options={})=>{
 const url=new URL(input);requests.push(url.pathname);
 assert(options.signal,'Every upstream request must be bounded');
 if(url.hostname==='www.google.com')return json({success:options.body.get('response')==='fictional-captcha',score:0.9,action:'login'});
 assert.equal(url.hostname,'fictional.invalid');
 assert.equal(options.headers.apikey,'fictional-key');
 if(url.pathname==='/auth/v1/user'){
  assert.equal(options.headers.Authorization,'Bearer fictional.access.token');
  return json(user,userStatus);
 }
 if(url.pathname==='/auth/v1/otp'){
  assert.equal(url.searchParams.get('redirect_to'),'https://unitedwoodfloorlayers.com/participant-login.html');
  assert.deepEqual(JSON.parse(options.body),{email:'maker@example.invalid',create_user:true});
  return json({},mailStatus);
 }
 assert.equal(url.pathname,'/rest/v1/registrations');
 assert.equal(url.searchParams.get('participant_number'),'eq.5');
 return json(row?[row]:[]);
};
const credentials={participant_number:5,email:'maker@example.invalid',access_token:'fictional.access.token'};
let request=0;
const event=data=>({headers:{'x-nf-client-connection-ip':'192.0.2.'+(++request)},body:JSON.stringify({participant_number:5,email:'maker@example.invalid',recaptcha_token:'fictional-captcha',...data})});
async function rejected(fn,status,message){await assert.rejects(fn,e=>e.status===status&&e.message===message);}
(async()=>{
 await rejected(()=>participant({...credentials,access_token:''}),401,'login_required');
 assert.equal(requests.length,0,'Missing token must not query private registrations');
 await rejected(()=>participant({...credentials,access_token:'not-a-jwt'}),401,'login_required');
 assert.equal(requests.length,0);
 assert.equal((await participant(credentials)).participant_number,5);
 row.email='other@example.invalid';
 await rejected(()=>participant(credentials),403,'credentials_mismatch');
 row.email=null;
 await rejected(()=>participant(credentials),403,'credentials_mismatch'); // legacy flag cannot bypass
 row.email='maker@example.invalid';
 user={...user,email_confirmed_at:null};
 await rejected(()=>participant(credentials),401,'login_required');
 user={...user,email_confirmed_at:'2026-01-01',is_anonymous:true};
 await rejected(()=>participant(credentials),401,'login_required');
 user={...user,is_anonymous:false,email:'attacker@example.invalid',user_metadata:{email:'maker@example.invalid',participant_number:5}};
 await rejected(()=>participant(credentials),403,'credentials_mismatch');
 user={...user,email:'maker@example.invalid'};
 userStatus=401;
 await rejected(()=>participant(credentials),401,'login_required');
 userStatus=500;
 await rejected(()=>participant(credentials),503,'service_unavailable');
 userStatus=200;
 requests=[];
 assert.deepEqual(await requestLink(event()),{ok:true});
 assert.equal(requests.filter(p=>p==='/auth/v1/otp').length,1);
 requests=[];
 row.email=null;
 assert.deepEqual(await requestLink(event()),{ok:true});
 assert(!requests.includes('/auth/v1/otp'));
 row.email='maker@example.invalid';
 assert.deepEqual(await requestLink(event({email:'other@example.invalid'})),{ok:true});
 assert(!requests.includes('/auth/v1/otp'));
 row.status='rejected';
 assert.deepEqual(await requestLink(event()),{ok:true});
 assert(!requests.includes('/auth/v1/otp'));
 row.status='approved';
 await rejected(()=>requestLink(event({recaptcha_token:'bad'})),400,'recaptcha_failed');
 assert(!requests.includes('/auth/v1/otp'));
 mailStatus=429;
 await rejected(()=>requestLink(event()),429,'rate_limited');
 mailStatus=500;
 await rejected(()=>requestLink(event()),503,'login_unavailable');
 process.env.PARTICIPANT_EMAIL_LOGIN_READY='false';
 requests=[];
 await rejected(()=>requestLink(event()),503,'login_unavailable');
 assert.equal(requests.length,0);
 process.env.PARTICIPANT_EMAIL_LOGIN_READY='true';mailStatus=200;
 const shared=event();
 for(let i=0;i<3;i++)await requestLink(shared);
 await rejected(()=>requestLink(shared),429,'rate_limited');
 console.log('Participant login checks passed: verified mailbox ownership, no legacy bypass, fail-closed auth, generic unknown accounts, CAPTCHA, fixed redirect, activation gate and request limits. No real emails.');
})().catch(e=>{console.error(e);process.exitCode=1;});
