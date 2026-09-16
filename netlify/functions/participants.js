'use strict';
const { endpoint, db, fail } = require('../lib/core');
exports.handler = endpoint('GET', async () => {
 const rows = await db('registrations?select=name,company,country,type,message,photo_url,participant_number&status=eq.approved');
 if (!Array.isArray(rows)) fail(502,'service_unavailable');
 return rows;
});
