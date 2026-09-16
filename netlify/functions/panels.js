'use strict';
const { endpoint, db, fail } = require('../lib/core');
exports.handler = endpoint('GET', async () => {
 const rows = await db('panels?select=id,participant_number,first_name,last_name,company,nationality,country_made,place_made,production_date,artwork_name,wood_species,pattern,story,why,meaning,materials,photos,contact_website,created_at&status=eq.approved');
 if (!Array.isArray(rows)) fail(502,'service_unavailable');
 return rows;
});
