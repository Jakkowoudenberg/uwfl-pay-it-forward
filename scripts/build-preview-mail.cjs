/* Generate only fictional review examples. No contacts, secrets or mail API. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),context={window:{}};vm.createContext(context);
for(const name of ['content','translations','experience','purpose','regional'])vm.runInContext(fs.readFileSync(path.join(root,'preview/assets',name+'.js'),'utf8'),context);
const regional=context.window.UWFL_REGIONAL.copy;
fs.writeFileSync(path.join(__dirname,'mail/regional-copy.json'),JSON.stringify(regional,null,2)+'\n');
const {buildApprovalMail,copy}=require('./mail/approval-mail.cjs');
const examples={};
for(const lang of Object.keys(copy)){
 examples[lang]={};
 for(const [region,origin] of Object.entries({eu:'NL',americas:'CA',other:'JP'})){
  const panel={id:'fictional-example',status:'approved',name:'Voorbeeld / Example',artwork_name:'Voorbeeldpaneel / Example panel',participant_number:'DEMO',shipping_country:origin,lang};
  const destination={region,address:copy[lang].exampleAddress,instructions:copy[lang].exampleInstructions};
  examples[lang][region]={pending:buildApprovalMail({...panel,status:'pending'},{[region]:destination}),approved:buildApprovalMail(panel,{[region]:destination})};
 }
}
fs.writeFileSync(path.join(root,'preview/assets/mail-examples.json'),JSON.stringify(examples,null,2)+'\n');
console.log('Prepared six-language mail templates and fictional regional examples; nothing sent.');
