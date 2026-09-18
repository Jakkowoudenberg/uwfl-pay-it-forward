(()=>{
'use strict';
// Consume the provider fragment before any third-party resource can load.
const params=new URLSearchParams(location.hash.slice(1));
let token=params.get('access_token')||'';
history.replaceState(null,'',location.pathname);
const language=(navigator.language||'en').slice(0,2);
const text={
en:['Email sign-in','You opened an email sign-in link. Continue only if you requested it yourself.','Continue to my panel','This link has expired or is invalid. Request a new link.','Request a new link','Your browser cannot store this sign-in. Enable storage for this website and request a new link.'],
nl:['Inloggen via e-mail','Je hebt een inloglink geopend. Ga alleen verder als je deze zelf hebt aangevraagd.','Verder naar mijn paneel','Deze link is verlopen of ongeldig. Vraag een nieuwe link aan.','Nieuwe link aanvragen','Je browser kan deze aanmelding niet bewaren. Sta opslag voor deze website toe en vraag een nieuwe link aan.'],
de:['Per E-Mail anmelden','Du hast einen Anmeldelink geöffnet. Fahre nur fort, wenn du ihn selbst angefordert hast.','Weiter zu meinem Paneel','Dieser Link ist abgelaufen oder ungültig. Fordere einen neuen an.','Neuen Link anfordern','Dein Browser kann die Anmeldung nicht speichern. Erlaube die Speicherung und fordere einen neuen Link an.'],
fr:['Connexion par e-mail','Vous avez ouvert un lien de connexion. Continuez uniquement si vous l’avez demandé.','Continuer vers mon panneau','Ce lien a expiré ou est invalide. Demandez-en un nouveau.','Demander un nouveau lien','Le navigateur ne peut pas enregistrer la connexion. Autorisez le stockage et demandez un nouveau lien.'],
es:['Acceso por correo','Has abierto un enlace de acceso. Continúa solo si lo solicitaste tú.','Continuar a mi panel','El enlace ha caducado o no es válido. Solicita uno nuevo.','Solicitar otro enlace','El navegador no puede guardar el acceso. Permite el almacenamiento y solicita otro enlace.'],
it:['Accesso via e-mail','Hai aperto un link di accesso. Continua solo se lo hai richiesto tu.','Continua al mio pannello','Il link è scaduto o non è valido. Richiedine uno nuovo.','Richiedi un nuovo link','Il browser non può salvare l’accesso. Consenti l’archiviazione e richiedi un nuovo link.']
};
const copy=text[language]||text.en;
document.documentElement.lang=text[language]?language:'en';
document.getElementById('title').textContent=copy[0];
document.getElementById('again').textContent=copy[4];
const message=document.getElementById('message'),button=document.getElementById('continue');
const valid=token.length<=8192&&/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)&&Number(params.get('expires_at'))>Date.now()/1000;
message.textContent=copy[valid?1:3];button.textContent=copy[2];button.hidden=!valid;
button.addEventListener('click',()=>{
 if(!valid||!token)return;
 try{sessionStorage.setItem('uwfl_participant_access',token);token='';location.replace('/#upload');}
 catch{message.textContent=copy[5];}
});
})();
