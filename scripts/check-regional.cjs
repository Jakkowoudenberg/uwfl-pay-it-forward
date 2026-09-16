/* Offline policy, privacy and mail checks. No real records or outbound mail. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),policy=require('../preview/assets/shipping-policy.js');
const {buildApprovalMail}=require('./mail/approval-mail.cjs');
let routes=0,mails=0;
for(const code of 'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE'.split(' ')){
 for(const lang of policy.locales){assert.equal(policy.regionForCountry(new Intl.DisplayNames([lang],{type:'region'}).of(code)),'eu');routes++;}
}
for(const value of ['US','USA','U.S.A.','united states','Verenigde Staten','États-Unis','Estados Unidos','CA','Canada','Canadá','Kanada','MX','México','BR','Brasil','AR','Argentina','CR','Costa Rica','TT','Trinidad and Tobago','PR','Puerto Rico']){assert.equal(policy.regionForCountry(value),'americas',value);routes++;}
for(const value of ['GB','UK','United Kingdom','CH','Switzerland','NO','Norway','IS','Iceland','TR','Türkiye','JP','Japan','AU','Australia','',null,'Unknown country','Other']){assert.equal(policy.regionForCountry(value),'other',String(value));routes++;}
const destinations={eu:{region:'eu',name:'Fictional collection point',address:'PRIVATE-ADDRESS-EU',instructions:'PRIVATE-INSTRUCTIONS-EU'},americas:{region:'americas',name:'Fictional Americas destination',address:'PRIVATE-ADDRESS-AMERICAS',instructions:'PRIVATE-INSTRUCTIONS-AMERICAS'}};
for(const lang of policy.locales)for(const [region,origin] of [['eu','NL'],['americas','CA'],['other','AU']]){
 const panel={id:'test-only',status:'approved',name:'Fictieve Maker',artwork_name:'Fictief Paneel',participant_number:'DEMO',shipping_country:origin,lang};
 // Approval alone produces the complete regional mail. No shipment decision,
 // release flag, second approval or Expo selection is supplied.
 const approved=buildApprovalMail(panel,destinations);assert.equal(approved.region,region);assert.equal(approved.lang,lang);assert.equal(approved.readyToShip,region!=='other');assert.equal(/PRIVATE-ADDRESS/.test(approved.text),region!=='other');mails++;
 for(const status of ['pending','rejected','archived',undefined]){assert.equal(buildApprovalMail({...panel,status},destinations),null);mails++;}
 const missing=buildApprovalMail(panel);assert.equal(missing.readyToShip,false);assert(!/PRIVATE-/.test(missing.text));mails++;
 for(const destination of [{...destinations.eu,region:'wrong'},{region,address:'',instructions:'Incomplete'},{region,address:'PRIVATE-ADDRESS',instructions:''}]){const mail=buildApprovalMail(panel,{[region]:destination});assert.equal(mail.readyToShip,false);assert(!/PRIVATE-/.test(mail.text));mails++;}
 const fallback=buildApprovalMail({...panel,shipping_country:'',country_made:origin},destinations);assert.equal(fallback.region,region);assert.equal(fallback.readyToShip,region!=='other');mails++;
 if(region==='americas'){
  const notSelected=buildApprovalMail({...panel,expo_selected:false},destinations);assert(notSelected.readyToShip,'Expo selection blocked approval email');assert(/32[– à]+36/.test(notSelected.text));
  const selected=buildApprovalMail({...panel,expo_selected:true},destinations);assert(selected.readyToShip);assert(selected.text!==notSelected.text,'Expo selection not reflected');mails+=2;
 }
}
assert.equal(buildApprovalMail({status:'approved',lang:'constructor',shipping_country:'NL'}).lang,'en');
assert.equal(buildApprovalMail({status:'approved',lang:'nl',shipping_country:'Canada',country_made:'NL'},destinations).region,'americas');
assert.equal(buildApprovalMail({status:'approved',shipping_country:'unknown',country_made:'NL'},destinations).readyToShip,false,'Unknown current origin silently fell back to old location');
const individual={countries:{JP:{region:'other',address:'PRIVATE-ADDRESS-JP',instructions:'PRIVATE-INSTRUCTIONS-JP'}}};
assert(buildApprovalMail({status:'approved',shipping_country:'JP'},individual).readyToShip);
assert(!buildApprovalMail({status:'approved',shipping_country:'AU'},individual).readyToShip);
assert(!buildApprovalMail({status:'approved',shipping_country:'AU'},{other:individual.countries.JP}).readyToShip,'A country-specific route became a global route');
const context={window:{}};vm.createContext(context);
for(const name of ['content','translations','experience','purpose','regional'])vm.runInContext(fs.readFileSync(path.join(root,'preview/assets',name+'.js'),'utf8'),context);
for(const [lang,copy] of Object.entries(context.window.UWFL_REGIONAL.copy)){
 for(const key of Object.keys(context.window.UWFL_REGIONAL.copy.nl))assert(typeof copy[key]==='string'&&copy[key].length,lang+'/'+key);
 assert(/32[– à]+36/.test(copy.expoSelection),lang+' Expo capacity');
 for(const key of ['expo','kickoff','news'])assert(context.window.UWFL_CONTENT.languages[lang].cards[key].body.includes(copy.privateText),lang+'/'+key+' lost private-delivery instructions');
 const press=fs.readFileSync(path.join(root,'preview/assets/press/UWFL-project-'+lang+'.txt'),'utf8');
 for(const key of ['journeyGatherTitle','journeyGatherText','euText','otherText','openEnd','privateText'])assert(press.includes(copy[key]),lang+' press missing '+key);
}
const forbidden=/Darwinstraat|Research Park|0318.?437111|bart@|6718 XR|63304|PRIVATE-ADDRESS|PRIVATE-INSTRUCTIONS/i;
function checkPublic(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())checkPublic(file);else if(/\.(js|json|html|txt|css)$/.test(file))assert(!forbidden.test(fs.readFileSync(file,'utf8')),'Private shipping details in '+path.relative(root,file));}}
checkPublic(path.join(root,'preview'));
execFileSync('python',['-c',"from zipfile import ZipFile\nfrom pathlib import Path\nimport re\np=Path('preview/assets/press/UWFL-press-kit.zip')\nwith ZipFile(p) as z:\n for n in z.namelist():\n  if n.endswith('.txt'):\n   assert not re.search(r'Darwinstraat|Research Park|bart@|6718 XR|63304', z.read(n).decode(), re.I),n\n"],{cwd:root});
console.log(JSON.stringify({countryRoutes:routes,mailCases:mails,languages:6,automaticApprovalMail:'passed',publicShippingPrivacy:'passed',regionalPressFiles:'passed',realEmailsSent:0}));
