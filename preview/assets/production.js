/* Loaded only by the production build. The separate design preview stays read-only. */
(()=>{
'use strict';
window.UWFL_LIVE=true;
const copy={
 preview:['Na inzenden beoordeelt het UWFL-team je bijdrage.','The UWFL team reviews your contribution after submission.','Das UWFL-Team prüft deinen Beitrag nach dem Absenden.','L’équipe UWFL examine votre contribution après l’envoi.','El equipo UWFL revisa tu contribución después del envío.','Il team UWFL verifica il tuo contributo dopo l’invio.'],
 checkPreview:['Versturen ter beoordeling','Submit for review','Zur Prüfung senden','Envoyer pour validation','Enviar para revisión','Invia per la verifica'],
 previewMessage:['Versturen','Send','Senden','Envoyer','Enviar','Invia'],
 uploadPreview:['Gebruik je deelnemersnummer en het e-mailadres van je aanmelding. Je paneel wordt pas zichtbaar na goedkeuring.','Use your participant number and registration email. Your panel becomes visible only after approval.','Verwende deine Teilnehmernummer und Anmelde-E-Mail. Dein Paneel wird erst nach Freigabe sichtbar.','Utilisez votre numéro de participant et votre e-mail d’inscription. Le panneau devient visible après validation.','Usa tu número de participante y correo de registro. El panel será visible tras su aprobación.','Usa il numero di partecipante e l’e-mail di iscrizione. Il pannello sarà visibile dopo l’approvazione.'],
 liveSaved:['Je inzending is ontvangen','Your submission has been received','Dein Beitrag ist eingegangen','Votre envoi a été reçu','Hemos recibido tu envío','Il tuo invio è stato ricevuto'],
 liveReview:['Het UWFL-team beoordeelt je inzending. Je gegevens en afbeeldingen verschijnen pas na goedkeuring.','The UWFL team will review your submission. Your profile and images appear only after approval.','Das UWFL-Team prüft deinen Beitrag. Profil und Bilder erscheinen erst nach Freigabe.','L’équipe UWFL examinera votre envoi. Votre profil et vos images apparaîtront après validation.','El equipo UWFL revisará tu envío. Tu perfil e imágenes aparecerán tras su aprobación.','Il team UWFL verificherà il tuo invio. Profilo e immagini appariranno dopo l’approvazione.'],
 liveContact:['Je bericht staat bij het UWFL-team. Het is privé en verschijnt niet op de website.','Your message is with the UWFL team. It is private and will not appear on the website.','Deine Nachricht ist beim UWFL-Team. Sie bleibt privat und erscheint nicht auf der Website.','Votre message est transmis à l’équipe UWFL. Il reste privé et ne paraîtra pas sur le site.','Tu mensaje está en manos del equipo UWFL. Es privado y no aparecerá en la web.','Il tuo messaggio è al team UWFL. È privato e non apparirà sul sito.'],
 liveSending:['Bezig met versturen…','Sending…','Wird gesendet…','Envoi en cours…','Enviando…','Invio in corso…'],
 liveError:['Versturen kon niet worden bevestigd. Je ingevulde gegevens staan er nog. Probeer opnieuw; dezelfde inzending wordt niet dubbel opgeslagen.','Submission could not be confirmed. Your details are still here. Try again; the same submission will not be saved twice.','Das Senden konnte nicht bestätigt werden. Deine Angaben sind noch da. Versuche es erneut; derselbe Beitrag wird nicht doppelt gespeichert.','L’envoi n’a pas pu être confirmé. Vos données sont conservées ici. Réessayez ; le même envoi ne sera pas enregistré deux fois.','No se pudo confirmar el envío. Tus datos siguen aquí. Inténtalo de nuevo; el mismo envío no se guardará dos veces.','L’invio non è stato confermato. I dati sono ancora qui. Riprova; lo stesso invio non verrà salvato due volte.'],
 liveCredentials:['De combinatie van deelnemersnummer en e-mailadres klopt niet. Controleer je bevestigingsmail of neem contact op.','The participant number and email do not match. Check your confirmation email or contact us.','Teilnehmernummer und E-Mail stimmen nicht überein. Prüfe deine Bestätigung oder kontaktiere uns.','Le numéro et l’e-mail ne correspondent pas. Vérifiez votre confirmation ou contactez-nous.','El número y el correo no coinciden. Revisa tu confirmación o contáctanos.','Numero ed e-mail non corrispondono. Controlla la conferma o contattaci.'],
 liveInvalid:['Controleer je gegevens en verplichte foto of logo. Gebruik bij een website het volledige https://-adres.','Check your details and required photo or logo. Use a full https:// address for a website.','Prüfe deine Angaben und das erforderliche Foto oder Logo. Gib Websites vollständig mit https:// an.','Vérifiez vos données et la photo ou le logo obligatoire. Utilisez une adresse de site complète avec https://.','Revisa tus datos y la foto o logo obligatorio. Usa una dirección web completa con https://.','Controlla i dati e la foto o il logo obbligatorio. Usa l’indirizzo web completo con https://.'],
 liveRate:['Even wachten: er zijn kort achter elkaar meerdere verzoeken gedaan. Probeer het over een minuut opnieuw.','Please wait: several requests were made in a short time. Try again in a minute.','Bitte warte: mehrere Anfragen in kurzer Zeit. Versuche es in einer Minute erneut.','Veuillez patienter : plusieurs demandes rapprochées. Réessayez dans une minute.','Espera un momento: se han hecho varias solicitudes seguidas. Reinténtalo en un minuto.','Attendi: sono state fatte più richieste ravvicinate. Riprova tra un minuto.'],
 liveCaptcha:['De beveiligingscontrole lukte niet. Ververs de pagina en probeer opnieuw.','The security check failed. Refresh the page and try again.','Die Sicherheitsprüfung ist fehlgeschlagen. Lade die Seite neu und versuche es erneut.','Le contrôle de sécurité a échoué. Actualisez la page et réessayez.','La comprobación de seguridad falló. Actualiza la página e inténtalo de nuevo.','Il controllo di sicurezza non è riuscito. Aggiorna la pagina e riprova.'],
 liveImages:['Kies maximaal acht foto’s, elk maximaal 5 MB.','Choose up to eight photos, each up to 5 MB.','Wähle bis zu acht Fotos mit jeweils höchstens 5 MB.','Choisissez jusqu’à huit photos de 5 Mo maximum chacune.','Elige hasta ocho fotos de un máximo de 5 MB cada una.','Scegli fino a otto foto da massimo 5 MB ciascuna.'],
 liveMailNote:['Je inzending is opgeslagen. De ontvangst van de bevestigingsmail kon niet worden gecontroleerd. Bewaar je deelnemersnummer en neem bij vragen contact op.','Your submission is saved. Receipt of the confirmation email could not be verified. Keep your participant number and contact us with any questions.','Dein Beitrag ist gespeichert. Der Empfang der Bestätigungs-E-Mail konnte nicht geprüft werden. Bewahre deine Teilnehmernummer auf und kontaktiere uns bei Fragen.','Votre envoi est enregistré. La réception du courriel n’a pas pu être vérifiée. Conservez votre numéro et contactez-nous en cas de question.','Tu envío está guardado. No se pudo verificar la recepción del correo. Guarda tu número y contáctanos si tienes preguntas.','Il tuo invio è salvato. La ricezione dell’e-mail non è stata verificata. Conserva il numero e contattaci per domande.'],
 adminLiveNote:['Inzendingen verschijnen pas na goedkeuring. Contactberichten blijven privé.','Submissions appear only after approval. Contact messages stay private.','Beiträge erscheinen erst nach Freigabe. Kontaktnachrichten bleiben privat.','Les envois apparaissent après validation. Les messages restent privés.','Los envíos aparecen tras su aprobación. Los mensajes son privados.','Gli invii appaiono dopo l’approvazione. I messaggi rimangono privati.'],
 adminMailNote:['Bij goedkeuring wordt automatisch de bestaande UWFL-maildienst aangeroepen met de verzendregio van dit paneel.','Approval automatically calls the existing UWFL mail service with this panel’s shipping region.','Die Freigabe ruft automatisch den bestehenden UWFL-Maildienst mit der Versandregion auf.','La validation appelle automatiquement le service de messagerie UWFL avec la région d’expédition.','La aprobación activa automáticamente el servicio de correo UWFL con la región de envío.','L’approvazione attiva automaticamente il servizio e-mail UWFL con la regione di spedizione.'],
 adminMessages:['Privéberichten','Private messages','Private Nachrichten','Messages privés','Mensajes privados','Messaggi privati'],
 adminHandled:['Afhandelen','Mark handled','Als erledigt markieren','Marquer comme traité','Marcar atendido','Segna come gestito'],
 adminOrgMedia:['Organisaties en media','Organisations and media','Organisationen und Medien','Organisations et médias','Organizaciones y medios','Organizzazioni e media'],
 adminMailStatus:['Mailcontrole','Mail status','E-Mail-Status','État des e-mails','Estado del correo','Stato delle e-mail'],
 adminMailPending:['De maildienst heeft de verzending niet bevestigd. Controleer dit voordat je opnieuw een bericht verstuurt.','The mail service has not confirmed sending. Check before sending another message.','Der Maildienst hat den Versand nicht bestätigt. Vor erneutem Versand prüfen.','Le service n’a pas confirmé l’envoi. Vérifiez avant de renvoyer un message.','El servicio no ha confirmado el envío. Compruébalo antes de enviar otro mensaje.','Il servizio non ha confermato l’invio. Verifica prima di inviare un altro messaggio.'],
 adminMailUnknown:['Het paneel is goedgekeurd. De mailverzending is niet bevestigd; kijk bij Mailcontrole.','The panel is approved. Email sending is unconfirmed; check Mail status.','Das Paneel ist freigegeben. E-Mail-Versand unbestätigt; prüfe E-Mail-Status.','Le panneau est validé. L’envoi du mail n’est pas confirmé ; consultez l’état des e-mails.','El panel está aprobado. El envío de correo no está confirmado; revisa su estado.','Il pannello è approvato. Invio e-mail non confermato; controlla lo stato.'],
 adminMakerPending:['Keur eerst de aanmelding van deze maker goed. Het paneel blijft in de wachtrij.','Approve this maker’s registration first. The panel remains in the queue.','Gib zuerst die Anmeldung dieses Makers frei. Das Paneel bleibt in der Warteschlange.','Validez d’abord l’inscription de ce créateur. Le panneau reste en attente.','Aprueba primero el registro del creador. El panel permanece en espera.','Approva prima l’iscrizione dell’autore. Il pannello resta in attesa.'],
 adminImageRequired:['Er ontbreekt een geldige foto of een logo. Deze inzending is nog niet goedgekeurd.','A valid photo or logo is missing. This submission has not been approved.','Ein gültiges Foto oder Logo fehlt. Dieser Beitrag wurde nicht freigegeben.','Une photo ou un logo valide manque. Cet envoi n’est pas validé.','Falta una foto o logo válido. Este envío no está aprobado.','Manca una foto o un logo valido. Questo invio non è approvato.']
};
Object.assign(window.UWFL_UI,copy);
const uploaded=new WeakMap();
const RECAPTCHA_SITE_KEY='6Lddlx4tAAAAAHZCoPVDvaYgUaHXy0Dwf89eRs8B';
function recaptcha(action){
 return new Promise((resolve,reject)=>{
  if(!window.grecaptcha?.ready){resolve('');return;}
  const timer=setTimeout(()=>reject(Object.assign(new Error('recaptcha_failed'),{code:'recaptcha_failed'})),9000);
  window.grecaptcha.ready(()=>{
   window.grecaptcha.execute(RECAPTCHA_SITE_KEY,{action}).then(token=>{clearTimeout(timer);resolve(token||'');},error=>{clearTimeout(timer);reject(Object.assign(error instanceof Error?error:new Error('recaptcha_failed'),{code:'recaptcha_failed'}));});
  });
 });
}
async function post(endpoint,data,action='submit'){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),55000);
 try{
  const token=await recaptcha(action);
  const response=await fetch('/.netlify/functions/'+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,recaptcha_token:token}),credentials:'omit',signal:controller.signal});
  const result=await response.json();
  if(!response.ok||result.ok===false){const error=new Error(result.error||'service_unavailable');error.code=result.error;throw error;}
  return result;
 }finally{clearTimeout(timer);}
}
async function imageData(file){
 if(!file||file.size>5*1024*1024)throw new Error('image_required');
 const url=URL.createObjectURL(file),image=new Image();
 try{
  image.src=url;await image.decode();
  let scale=Math.min(1,1800/image.naturalWidth,1800/image.naturalHeight);
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  let data=canvas.toDataURL('image/webp',.88);
  if(data.length>3e6)data=canvas.toDataURL('image/webp',.65);
  if(data.length>4e6)throw new Error('image_too_large');
  return {fileData:data,fileType:data.slice(5,data.indexOf(';')),fileName:file.name};
 }finally{URL.revokeObjectURL(url);}
}
async function upload(file,endpoint,extra={}){
 let known=uploaded.get(file);if(!known){known=new Map();uploaded.set(file,known);}
 if(known.has(endpoint))return known.get(endpoint);
 const task=(async()=>{const image=await imageData(file);const result=await post(endpoint,{...image,...extra},'upload');if(!result.url)throw new Error('upload_failed');return result.url;})();
 known.set(endpoint,task);
 try{return await task;}catch(error){known.delete(endpoint);throw error;}
}
function id(draft){return draft._requestId||(draft._requestId=crypto.randomUUID());}
function selectedCountry(draft,key){return draft[key]==='Other'?draft[key+'-other']:draft[key];}
window.UWFL_SUBMIT={
 async join(draft,photo,lang){
  const data={request_id:id(draft),naam:draft.name,bedrijf:draft.company,email:draft.email,land:selectedCountry(draft,'country'),telefoon:draft.phone,vak:draft.trade,bericht:draft.story,type:{maker:'Maker',contributor:'Contributor',participant:'Participant',student:'Student'}[draft.role],social_post:draft.share,lang};
  data.photo_url=await upload(photo.file,'upload-photo');return post('register',data,'register');
 },
 lookup(draft){return post('panel-lookup',{participant_number:draft['participant-number'],email:draft['panel-email']},'lookup');},
 async panel(draft,photos,lang){
  const data={...window.UWFL_PANEL.fromDraft(draft),request_id:id(draft),participant_number:draft['participant-number'],email:draft['panel-email'],shipping_country:selectedCountry(draft,'shipping-country'),lang};
  if(!photos.length||photos.length>8)throw new Error('image_required');
  data.photos=[];
  for(const photo of photos)data.photos.push(await upload(photo.file,'panel-photo',{participant_number:data.participant_number,email:data.email}));
  return post('panel-submit',data,'panel');
 },
 async profile(kind,draft,logo,lang){
  const org=kind!=='sponsor';
  const data={request_id:id(draft),company:draft['contact-company'],name:draft['contact-company'],country:selectedCountry(draft,'profile-country'),contact_email:draft['contact-email'],submitter_email:draft['contact-email'],contact_phone:draft['contact-phone'],contact_website:draft['contact-website'],why:draft.why,what:draft.what,role:[draft.why,draft.what].filter(Boolean).join('\n\n'),category:kind==='media-partner'?'media':'organisation',lang};
  data.logo_url=await upload(logo.file,org?'org-logo':'sponsor-logo');return post(org?'org-submit':'sponsor-submit',data,org?'organisation':'sponsor');
 },
 contact(draft,context,lang){return post('contact-submit',{request_id:id(draft),name:draft['contact-name'],company:draft['contact-company'],email:draft['contact-email'],message:draft['contact-message'],context,lang},'contact');},
 error(error){if(error.code==='credentials_mismatch'||error.code==='missing_credentials')return 'liveCredentials';if(error.code==='rate_limited')return 'liveRate';if(error.code==='recaptcha_failed')return 'liveCaptcha';if(/invalid_|image_|missing_/.test(error.code||error.message))return 'liveInvalid';return 'liveError';}
};
})();
