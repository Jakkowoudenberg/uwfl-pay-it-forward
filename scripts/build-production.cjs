'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'preview');
const out = path.join(root, 'dist');
const site = 'https://unitedwoodfloorlayers.com';

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const excluded = new Set(['qa.js', 'qa.css', 'mail-review.js', 'mail-review.css', 'mail-examples.json']);

function copy(dir, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const src = path.join(dir, entry.name);
    const dest = path.join(target, entry.name);
    if (entry.isDirectory()) copy(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

const esc = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

copy(path.join(source, 'assets'), path.join(out, 'assets'));

// Responsive review tools exist only on a Netlify deploy preview.
if (process.env.CONTEXT === 'deploy-preview') {
  fs.copyFileSync(path.join(source, '_qa.html'), path.join(out, '_qa.html'));
  for (const file of ['qa.js', 'qa.css']) fs.copyFileSync(path.join(source, 'assets', file), path.join(out, 'assets', file));
}

const assetHash = crypto.createHash('sha256');
for (const file of fs.readdirSync(path.join(out, 'assets')).filter(name => /\.(?:js|css)$/.test(name)).sort()) {
  assetHash.update(file).update(fs.readFileSync(path.join(out, 'assets', file)));
}
const version = assetHash.digest('hex').slice(0, 12);

const organizationJson = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'United Woodfloor Layers',
  alternateName: 'UWFL Pay It Forward',
  url: site + '/',
  logo: site + '/icon-512.png',
  image: site + '/og-uwfl-2026.jpg',
  description: 'United Woodfloor Layers — Pay It Forward is a worldwide wood flooring movement. Makers create one shared wooden artwork, share craftsmanship and help three people.',
  founder: { '@type': 'Person', name: 'Jakko Woudenberg', alternateName: 'Dutch Wood Artist' },
  sameAs: ['https://www.instagram.com/unitedwoodfloorlayers/']
};

const websiteJson = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'United Woodfloor Layers — Pay It Forward',
  url: site + '/',
  inLanguage: ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'pl'],
  description: 'Information, registration and public profiles for the United Woodfloor Layers Pay It Forward project.'
};

for (const file of ['index.html', 'admin.html']) {
  let html = fs.readFileSync(path.join(source, file), 'utf8');
  html = html.replace(
    '<script src="assets/' + (file === 'index.html' ? 'app' : 'admin') + '.js" defer></script>',
    '<script src="assets/production.js" defer></script>\n  <script src="assets/' + (file === 'index.html' ? 'app' : 'admin') + '.js" defer></script>'
  );
  html = html.replace(/(assets\/[^"?]+\.(?:js|css))"/g, '$1?v=' + version + '"');
  if (file === 'index.html') {
    html = html.replace('<meta name="robots" content="noindex,nofollow">', '<meta name="robots" content="index,follow">');
    html = html.replace('UWFL — Pay It Forward · Design preview', 'United Woodfloor Layers — Pay It Forward');
    html = html.replace('</head>', `  <link rel="canonical" href="${site}/">
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/icon-192.png">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="UWFL">
  <meta name="keywords" content="United Woodfloor Layers, UWFL, Pay It Forward, wood flooring, parquet, parquet layers, wood floor art, craftsmanship, global wood flooring project, donated artwork, flooring trade, makers, sponsors">
  <meta property="og:title" content="United Woodfloor Layers — Pay It Forward">
  <meta property="og:description" content="A worldwide Pay It Forward movement in the wood flooring trade. Makers create one shared wooden artwork, share craftsmanship and help three people.">
  <meta property="og:image" content="${site}/og-uwfl-2026.jpg">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${site}/">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="United Woodfloor Layers — Pay It Forward">
  <meta name="twitter:description" content="A worldwide wood flooring movement where makers create one shared artwork, share craftsmanship and help three people.">
  <meta name="twitter:image" content="${site}/og-uwfl-2026.jpg">
  <script src="https://www.google.com/recaptcha/api.js?render=6Lddlx4tAAAAAHZCoPVDvaYgUaHXy0Dwf89eRs8B" async defer></script>
  <script type="application/ld+json">${JSON.stringify(organizationJson)}</script>
  <script type="application/ld+json">${JSON.stringify(websiteJson)}</script>
  <style>#preview-note{display:none}.registration-number{font-size:1.35rem;margin:1.5rem 0}form[aria-busy=true]{opacity:.8}</style>
</head>`);
  }
  fs.writeFileSync(path.join(out, file), html);
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
manifest.background_color = '#ffffff';
manifest.theme_color = '#ffffff';
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));

for (const file of ['icon-192.png', 'icon-192-maskable.png', 'icon-512.png', 'icon-512-maskable.png', 'og-uwfl-2026.jpg']) {
  fs.copyFileSync(path.join(root, file), path.join(out, file));
}

// Keep the app installable without caching submissions or old page versions.
fs.copyFileSync(path.join(root, 'sw.js'), path.join(out, 'sw.js'));

const seoPages = [
  {
    slug: 'about',
    title: 'About United Woodfloor Layers — Pay It Forward',
    description: 'United Woodfloor Layers is a worldwide Pay It Forward movement in the wood flooring trade. Makers create one shared wooden artwork, share craftsmanship and help three people.',
    hash: '#about',
    body: [
      'United Woodfloor Layers — Pay It Forward brings the worldwide wood flooring trade together around one shared wooden artwork.',
      'Makers from all over the world create a one square metre wooden panel with their own story, technique, material choice and meaning. Together the panels show the craftsmanship, creativity and humanity in the wood flooring trade.',
      'The project is open-ended. The artwork will travel, bring people together and eventually be donated to one or more meaningful places. It will not be sold.'
    ]
  },
  {
    slug: 'pay-it-forward',
    title: 'Pay It Forward — Help Three People',
    description: 'Every participant is invited to help three people and ask them to pass that help on. The help can be about ordinary life, not only wood flooring.',
    hash: '#read/3mensen',
    body: [
      'The Pay It Forward idea is simple: help three people and ask them to pass that help on.',
      'That help does not have to be about floors, wood or the trade. It can be ordinary human help: time, attention, knowledge, a network, a conversation or simply being there.',
      'One person helps three people. Those three each help three others. A small act can grow into a movement that reaches far beyond the craft.'
    ]
  },
  {
    slug: 'makers',
    title: 'Makers and Parquet Layers',
    description: 'Makers and parquet layers can join UWFL by creating a one square metre wooden panel with a story, technique, material choice and meaning.',
    hash: '#makers',
    body: [
      'Makers create a wooden panel of one square metre. Each panel carries its own story, technique, material choice and meaning.',
      'Along the way, makers share knowledge, pass on techniques and connect with young makers, experienced craftspeople, students, companies, schools and organisations.',
      'Participants upload their panel and story for review before anything appears publicly.'
    ]
  },
  {
    slug: 'sponsors',
    title: 'Sponsors and Partners',
    description: 'Sponsors can support UWFL with materials, transport, financial support, visibility or practical help for a worldwide wood flooring movement.',
    hash: '#partners',
    body: [
      'Sponsors make it possible for the project to grow professionally and internationally.',
      'Companies can contribute materials, transport, financial support, visibility or practical help. Sponsors connect their name to craftsmanship, social impact and international cooperation.',
      'Sponsor profiles are reviewed before they appear publicly.'
    ]
  },
  {
    slug: 'organisations',
    title: 'Trade Organisations and Schools',
    description: 'Trade organisations, schools and industry partners can help United Woodfloor Layers connect people, preserve knowledge and inspire new generations.',
    hash: '#organisations',
    body: [
      'Trade organisations, schools and industry partners can help connect people, preserve knowledge and inspire new generations.',
      'The project gives the wood flooring trade a positive shared story: craftsmanship, creativity, education, social impact and international connection.',
      'Organisation profiles are reviewed before they appear publicly.'
    ]
  },
  {
    slug: 'media',
    title: 'Media and Press Information',
    description: 'Media can help tell the stories behind UWFL, the makers, the panels, the Pay It Forward idea and the worldwide wood flooring movement.',
    hash: '#read/press',
    body: [
      'Media can help tell the stories behind United Woodfloor Layers, the makers, the panels and the Pay It Forward idea.',
      'The project shows that wood flooring is not only technical work, but can also be an art form with social impact.',
      'Public stories, approved profiles and panel images may be used with proper credit to the maker and UWFL Pay It Forward.'
    ]
  },
  {
    slug: 'panel-rules',
    title: 'Panel Rules and Registration',
    description: 'UWFL panels are reviewed before publication. Participants register, upload photos and story details, and wait for approval.',
    hash: '#read/regels',
    body: [
      'Every panel and registration is reviewed before it appears publicly.',
      'Participants register, upload photos and the story of their panel, including materials, meaning and process, then wait for approval.',
      'The project is made to connect, not divide. Panels should respect the shared purpose of connection, craftsmanship and Pay It Forward.'
    ]
  }
];

function seoHtml(page) {
  const url = site + '/' + page.slug + '/';
  const articleJson = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.description,
    mainEntityOfPage: url,
    publisher: { '@type': 'Organization', name: 'United Woodfloor Layers', url: site + '/' }
  };
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="index,follow">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${site}/og-uwfl-2026.jpg">
  <script type="application/ld+json">${JSON.stringify(articleJson)}</script>
  <style>body{margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#17211f;background:#fff;line-height:1.65}main{max-width:760px;margin:auto;padding:48px 22px}a{color:#17211f}h1{line-height:1.1;font-size:clamp(2rem,5vw,3.5rem)}.cta{display:inline-block;margin-top:24px;padding:12px 18px;border:1px solid #17211f;border-radius:8px;text-decoration:none;font-weight:700}.eyebrow{text-transform:uppercase;letter-spacing:.12em;color:#60726c;font-size:.78rem;font-weight:700}</style>
</head>
<body>
  <main>
    <p class="eyebrow">United Woodfloor Layers · Pay It Forward</p>
    <h1>${esc(page.title)}</h1>
    ${page.body.map(p => `<p>${esc(p)}</p>`).join('\n    ')}
    <a class="cta" href="/${page.hash}">Open the UWFL app</a>
    <p><a href="/">United Woodfloor Layers homepage</a></p>
  </main>
</body>
</html>`;
}

for (const page of seoPages) {
  const dir = path.join(out, page.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), seoHtml(page));
}

const sitemapUrls = [{ loc: site + '/', priority: '1.0' }, ...seoPages.map(page => ({ loc: site + '/' + page.slug + '/', priority: '0.8' }))];
fs.writeFileSync(path.join(out, 'robots.txt'), 'User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /.netlify/\nSitemap: ' + site + '/sitemap.xml\n');
fs.writeFileSync(path.join(out, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + sitemapUrls.map(url => `  <url><loc>${url.loc}</loc><changefreq>weekly</changefreq><priority>${url.priority}</priority></url>`).join('\n') + '\n</urlset>\n');
fs.writeFileSync(path.join(out, 'llms.txt'), `# United Woodfloor Layers — Pay It Forward

United Woodfloor Layers, also known as UWFL Pay It Forward, is a worldwide movement in the wood flooring trade.

Core idea: makers create one shared wooden artwork from one square metre panels, share craftsmanship, and help three people who are asked to pass that help on.

Primary URL: ${site}/

Important pages:
- ${site}/about/ — project purpose and artwork journey
- ${site}/pay-it-forward/ — help three people and pass it forward
- ${site}/makers/ — makers, parquet layers and panel participation
- ${site}/sponsors/ — sponsor and partner opportunities
- ${site}/organisations/ — trade organisations, schools and industry partners
- ${site}/media/ — press and media information
- ${site}/panel-rules/ — panel rules, registration and moderation

Founder / initiator: Jakko Woudenberg, Dutch Wood Artist, master parquet layer and artist from the Netherlands.

The artwork is intended to travel and eventually be donated to one or more meaningful places. It is not for sale.
`);

fs.writeFileSync(path.join(out, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
  Content-Security-Policy: default-src 'self'; script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: blob: data:; connect-src 'self' https://www.google.com/recaptcha/; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/
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

fs.writeFileSync(path.join(out, 'release.json'), JSON.stringify({ version, commit: process.env.COMMIT_REF || null }));
console.log('Production app built: ' + version);
