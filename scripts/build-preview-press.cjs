/* Rebuild public press assets from the same reviewed copy used by the preview. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../preview');
const context={window:{}};vm.createContext(context);
for(const name of ['content.js','translations.js','experience.js','purpose.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets',name),'utf8'),context);
const {UWFL_UI:ui,UWFL_LOCALES:locales,UWFL_CONTENT:content}=context.window;
const dir=path.join(root,'assets/press');fs.mkdirSync(dir,{recursive:true});
const plain=s=>String(s).replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
for(const [i,lang] of locales.entries()){
 const t=key=>plain(ui[key][i]);
 const body=content.languages[lang].cards.initiator.body;
 const quote=plain((body.match(/<p>[^<]*<strong>[^<]*<\/strong>[^<]*<\/p>/)||[''])[0]);
 const text=[
  'UNITED WOOD FLOOR LAYERS - PAY IT FORWARD',t('pressFactSheet'),
  '',t('heroIntro'),'',t('audContributors'),t('helpIntro'),'',t('collectiveTitle'),t('collectiveIntro'),
  ...['Knowledge','Reach','Craft'].flatMap(key=>['',t('collective'+key+'Title'),t('collective'+key+'Text')]),
  '',t('journeyTitle'),
  ...['Make','Travel','Gift'].flatMap((key,i)=>['',`${i+1}. ${t('journey'+key+'Title')}`,t('journey'+key+'Text')]),
  '',t('neverSold'),'',
  'Jakko Woudenberg - '+t('founderRole'),quote,'',
  t('projectResponsibility'),'',t('plannedNext')+': '+t('expoPlace'),t('expoDate'),
  '',t('answer4'),'',t('moderationText'),'',t('equalVisibility'),
  '',t('pressNote'),t('pressCredits'),'',
  'https://app.unitedwoodfloorlayers.com/',
  '', '2026-09-16', ''
 ].join('\n');
 fs.writeFileSync(path.join(dir,`UWFL-project-${lang}.txt`),text);
}
fs.writeFileSync(path.join(dir,'CREDITS.txt'),[
 'UWFL Pay It Forward - press assets',
 '', 'Jakko-Woudenberg-Cora-Deutecom.jpg',
 'Jakko Woudenberg / Dutch Wood Artist with The Nightwatch in Wood.',
 'Photograph: Cora Deutecom. Credit both the photographer and UWFL Pay It Forward.',
 'The Nightwatch in Wood is a separate artwork. This image is not a completed UWFL collective artwork.',
 '', 'UWFL-logo.jpg', 'UWFL Pay It Forward project logo.',
 '', 'Files are supplied for reporting about UWFL Pay It Forward.',
 'For other uses, further images or interviews: contact UWFL through the project app.',
 'https://app.unitedwoodfloorlayers.com/',
 '', 'The information sheets are dated 2026-09-16. Consult the app for current arrangements.',
 'Participant numbers, countries and panel images in the app may change; they are not fixed in these sheets.', ''
].join('\n'));
execFileSync('python',['-c',`
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(${JSON.stringify(root)})
target=root/'assets/press'
with ZipFile(target/'UWFL-press-kit.zip','w',ZIP_DEFLATED) as archive:
 for item in sorted(target.glob('*.txt')):
  archive.write(item,item.name)
 archive.write(root/'assets/jakko-woudenberg.jpg','Jakko-Woudenberg-Cora-Deutecom.jpg')
 archive.write(root/'assets/uwfl-logo.jpg','UWFL-logo.jpg')
`]);
console.log('Press kit generated: six information sheets, credits, portrait and logo.');
