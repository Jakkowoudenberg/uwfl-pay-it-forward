'use strict';
const { endpoint, db, fail } = require('../lib/core');
exports.handler = endpoint('GET', async () => {
 const rows = await db('sponsors?select=id,company,country,logo_url,why,what,lang,contact_website,contact_email,contact_phone&status=eq.approved');
 if (!Array.isArray(rows)) fail(502,'service_unavailable');
 return rows;
});
