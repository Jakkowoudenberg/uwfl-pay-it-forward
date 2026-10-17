/* Device-only drafts. No credentials, emails or public URLs are persisted. */
(()=>{'use strict';let connection;const name='uwfl-artwork-drafts';
function open(){if(!connection)connection=new Promise((resolve,reject)=>{if(!window.indexedDB)return reject(Error('storage_unavailable'));const req=indexedDB.open(name,1);req.onupgradeneeded=()=>req.result.createObjectStore('drafts');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});return connection;}
async function operation(mode,key,value){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('drafts',mode),s=tx.objectStore('drafts');const req=mode==='readonly'?s.get(key):value===null?s.delete(key):s.put(value,key);let out;req.onsuccess=()=>{out=req.result;};tx.oncomplete=()=>resolve(out);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('storage_failed'));});}
window.UWFL_DRAFTS={load:number=>operation('readonly',String(number)),save:(number,draft,files,step)=>operation('readwrite',String(number),{draft,files,step,updated_at:new Date().toISOString()}),remove:number=>operation('readwrite',String(number),null)};
})();
