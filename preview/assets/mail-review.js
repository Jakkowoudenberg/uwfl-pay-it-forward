/* Review examples only. No personal fields, server decisions or outbound mail. */
(()=>{
 'use strict';
 let examples;
 const country=document.getElementById('mail-country'),language=document.getElementById('mail-language'),state=document.getElementById('mail-state');
 function render(){
  if(!examples)return;
  const region=window.UWFL_SHIPPING.regionForCountry(country.value),message=examples[language.value][region][state.value];
  document.querySelector('article').lang=message?.lang||'nl';
  document.getElementById('mail-subject').textContent=message?.subject||'Er wordt nog geen goedkeuringsmail verstuurd';
  document.getElementById('mail-body').textContent=message?.text||'Het paneel wacht op beoordeling door Jakko. Zodra hij het goedkeurt, volgt automatisch de mail voor de regio van de maker.';
  document.getElementById('mail-status').textContent='Regio: '+({eu:'EU',americas:'Amerika’s, inclusief Canada',other:'overige / nog te bepalen'}[region])+' · '+(!message?'wacht op paneelgoedkeuring':message.readyToShip?'automatische goedkeuringsmail met verzendgegevens':'automatische goedkeuringsmail; aanleverroute nog niet beschikbaar');
 }
 document.getElementById('review-controls').addEventListener('submit',event=>event.preventDefault());
 for(const el of [country,language,state])el.addEventListener('input',render);
 fetch('assets/mail-examples.json',{method:'GET',credentials:'omit'}).then(r=>{if(!r.ok)throw new Error('unavailable');return r.json();}).then(data=>{examples=data;render();}).catch(()=>{document.getElementById('mail-body').textContent='De voorbeelden konden niet worden geladen. Vernieuw deze pagina.';});
})();
