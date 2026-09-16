'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),source=path.join(root,'preview'),out=path.join(root,'dist');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const excluded=new Set(['qa.js','qa.css','mail-review.js','mail-review.css','mail-examples.json']);
function copy(dir,target){fs.mkdirSync(target,{recursive:true});for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(excluded.has(entry.name))continue;const src=path.join(dir,entry.name),dest=path.join(target,entry.name);if(entry.isDirectory())copy(src,dest);else fs.copyFileSync(src,dest);}}
copy(path.join(source,'assets'),path.join(out,'assets'));
// Responsive review tools exist only on a Netlify deploy preview.
if(process.env.CONTEXT==='deploy-preview'){fs.copyFileSync(path.join(source,'_qa.html'),path.join(out,'_qa.html'));for(const file of ['qa.js','qa.css'])fs.copyFileSync(path.join(source,'assets',file),path.join(out,'assets',file));}
const assetHash=crypto.createHash('sha256');
for(const file of fs.readdirSync(path.join(out,'assets')).filter(name=>/\.(?:js|css)$/.test(name)).sort())assetHash.update(file).update(fs.readFileSync(path.join(out,'assets',file)));
const version=assetHash.digest('hex').slice(0,12);
for(const file of ['index.html','admin.html']){
 let html=fs.readFileSync(path.join(source,file),'utf8');
 html=html.replace('<script src="assets/'+(file==='index.html'?'app':'admin')+'.js" defer></script>','<script src="assets/production.js" defer></script>\n  <script src="assets/'+(file==='index.html'?'app':'admin')+'.js" defer></script>');
 html=html.replace(/(assets\/[^"?]+\.(?:js|css))"/g,'$1?v='+version+'"');
 if(file==='index.html'){
  html=html.replace('<meta name="robots" content="noindex,nofollow">','<meta name="robots" content="index,follow">');
  html=html.replace('UWFL — Pay It Forward · Design preview','United Woodfloor Layers — Pay It Forward');
  html=html.replace('</head>',`  <link rel="canonical" href="https://unitedwoodfloorlayers.com/">\n  <link rel="manifest" href="/manifest.json">\n  <link rel="apple-touch-icon" href="/icon-192.png">\n  <meta name="mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-status-bar-style" content="default">\n  <meta name="apple-mobile-web-app-title" content="UWFL">\n  <meta property="og:title" content="United Woodfloor Layers — Pay It Forward">\n  <meta property="og:description" content="Make together. Share craftsmanship. Help three people. A worldwide movement through the art of wood flooring.">\n  <meta property="og:image" content="https://unitedwoodfloorlayers.com/og-uwfl-2026.jpg">\n  <meta property="og:type" content="website">\n  <meta property="og:url" content="https://unitedwoodfloorlayers.com/">\n  <style>#preview-note{display:none}.registration-number{font-size:1.35rem;margin:1.5rem 0}form[aria-busy=true]{opacity:.8}</style>\n</head>`);
 }
 fs.writeFileSync(path.join(out,file),html);
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
manifest.background_color='#ffffff';manifest.theme_color='#ffffff';
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
for(const file of ['icon-192.png','icon-192-maskable.png','icon-512.png','icon-512-maskable.png','og-uwfl-2026.jpg'])fs.copyFileSync(path.join(root,file),path.join(out,file));
// Keep the app installable without caching submissions or old page versions.
fs.copyFileSync(path.join(root,'sw.js'),path.join(out,'sw.js'));
fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /.netlify/\nSitemap: https://unitedwoodfloorlayers.com/sitemap.xml\n');
fs.writeFileSync(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://unitedwoodfloorlayers.com/</loc></url></urlset>');
fs.writeFileSync(path.join(out,'_headers'),`/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: blob: data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; frame-src 'self'
/index.html
  Cache-Control: no-cache
/
  Cache-Control: no-cache
/admin.html
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-store
/sw.js
  Cache-Control: no-cache
`);
fs.writeFileSync(path.join(out,'release.json'),JSON.stringify({version,commit:process.env.COMMIT_REF||null}));
console.log('Production app built: '+version);
