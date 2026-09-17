/* Shared regional policy for the design and offline mail preparation.
   No destinations, addresses, contacts or network requests belong here. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.UWFL_SHIPPING=factory();
})(typeof window==='object'?window:this,function(){
 'use strict';
 const eu=new Set('AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE'.split(' '));
 const americas=new Set('AG AI AR AW BB BL BM BO BQ BR BS BZ CA CL CO CR CU CW DM DO EC FK GD GF GL GP GT GY HN HT JM KN KY LC MF MQ MS MX NI PA PE PM PR PY SR SV SX TC TT US UY VC VE VG VI'.split(' '));
 const locales=['nl','en','de','fr','es','it','pt','pl'];
 const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const aliases=new Map();
 for(const lang of locales){
  const names=new Intl.DisplayNames([lang],{type:'region'});
  for(const code of [...eu,...americas]){const name=names.of(code);aliases.set(fold(name),code);if(lang==='en')aliases.set(fold(name.replace(/&/g,'and')),code);}
 }
 for(const [name,code] of Object.entries({'holland':'NL','the netherlands':'NL','usa':'US','u s a':'US','u s':'US','united states of america':'US','etats unis d amerique':'US','uk':'GB','united kingdom':'GB','great britain':'GB','saint kitts and nevis':'KN','saint lucia':'LC','saint vincent and the grenadines':'VC'}))aliases.set(name,code);
 function countryCode(value){const text=String(value||'').trim();if(!text)return '';const alias=aliases.get(fold(text));if(alias)return alias;return /^[a-z]{2}$/i.test(text)?text.toUpperCase():'';}
 function regionForCountry(value){const code=countryCode(value);return eu.has(code)?'eu':americas.has(code)?'americas':'other';}
 return {countryCode,regionForCountry,locales};
});
