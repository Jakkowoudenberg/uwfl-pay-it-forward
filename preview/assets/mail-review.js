/* Review examples only. No personal fields, server decisions or outbound mail. */
(()=>{
 'use strict';
 let examples;
 const country=document.getElementById('mail-country'),language=document.getElementById('mail-language'),state=document.getElementById('mail-state');
 function render(){if(!examples)return;const region=window.UWFL_SHIPPING.regionForCountry(country.value),message=examples[language.value][region][state.value];document.querySelector('article').lang=message.lang;document.getElementById('mail-subject').textContent=message.subject;document.getElementById('mail-body').textContent=message.text;document.getElementById('mail-status').textContent='Regio: '+({eu:'EU',americas:'Amerika’s, inclusief Canada',other:'overige / nog te bepalen'}[region])+' · '+(message.readyToShip?'voorbeeld met persoonlijk bevestigde aanlevering':'wachten op persoonlijke verzendinstructies');}
 document.getElementById('review-controls').addEventListener('submit',event=>event.preventDefault());
 for(const el of [country,language,state])el.addEventListener('input',render);
 fetch('assets/mail-examples.json',{method:'GET',credentials:'omit'}).then(r=>{if(!r.ok)throw new Error('unavailable');return r.json();}).then(data=>{examples=data;render();}).catch(()=>{document.getElementById('mail-body').textContent='De voorbeelden konden niet worden geladen. Vernieuw deze pagina.';});
})();
