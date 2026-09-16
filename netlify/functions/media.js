'use strict';
const { endpoint, db, fail } = require('../lib/core');
exports.handler = endpoint('GET', async () => {
 const rows = await db('organisations?select=id,name,country,logo_url,role,lang,contact_website,contact_email,contact_phone&status=eq.approved&category=eq.media');
 if (!Array.isArray(rows)) fail(502,'service_unavailable');
 return rows;
});
