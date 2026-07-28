// Bepaalt de verzendregio uit het land van de maker.
// eu = Europa (naar Eric), americas = Noord/Zuid-Amerika (naar Lenny),
// other = rest van de wereld (persoonlijk contact).
function regionForCountry(country) {
  var c = (country || '').trim().toLowerCase();
  if (!c) return 'other';
  var EU = [
    'netherlands','holland','belgium','belgië','belgie','germany','deutschland','france',
    'italy','italia','spain','españa','espana','portugal','united kingdom','uk','england',
    'scotland','wales','northern ireland','great britain','ireland','austria','switzerland',
    'poland','sweden','norway','denmark','finland','iceland','czech republic','czechia',
    'slovakia','hungary','romania','bulgaria','greece','croatia','slovenia','serbia','bosnia',
    'estonia','latvia','lithuania','luxembourg','malta','cyprus','ukraine','moldova','albania',
    'north macedonia','macedonia','montenegro','kosovo','liechtenstein','monaco','andorra','san marino'
  ];
  var AMERICAS = [
    'united states','united states of america','usa','us','u.s.','u.s.a.','america','canada',
    'mexico','méxico','brazil','brasil','argentina','chile','colombia','peru','perú','venezuela',
    'ecuador','bolivia','paraguay','uruguay','guatemala','honduras','el salvador','nicaragua',
    'costa rica','panama','panamá','cuba','dominican republic','puerto rico','jamaica','haiti'
  ];
  if (EU.indexOf(c) > -1) return 'eu';
  if (AMERICAS.indexOf(c) > -1) return 'americas';
  return 'other';
}

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const adminKey = event.headers['x-admin-key'];
  if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const { id, action } = event.queryStringParameters || {};
  if (!id || !action) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing params' }) };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    if (action === 'approve') {
      await fetch(`${SUPABASE_URL}/rest/v1/panels?id=eq.${id}`, {
        method: 'PATCH',
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });

      // Goedkeuringsmail met verzendadres, via het Apps Script. We halen het
      // paneel op voor de makergegevens en bepalen de regio uit het land.
      try {
        const pr = await fetch(
          `${SUPABASE_URL}/rest/v1/panels?select=participant_number,first_name,last_name,artwork_name,country_made,submitter_email,lang&id=eq.${id}`,
          { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } }
        );
        const prows = await pr.json();
        const p = Array.isArray(prows) && prows[0];
        if (p && p.submitter_email && p.submitter_email.indexOf('@') > -1) {
          const region = regionForCountry(p.country_made);
          await fetch('https://script.google.com/macros/s/AKfycbzWD7r75jPpEdAwyTjHHyGYB_WGApbLribkRIXhdchkjRF48W7TeeStunHldq1ybtKG/exec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'panel_approved',
              naam: ((p.first_name || '') + ' ' + (p.last_name || '')).trim(),
              email: p.submitter_email,
              lang: (p.lang || 'en'),
              participant_number: p.participant_number,
              artwork_name: p.artwork_name,
              region: region
            })
          });
        }
      } catch (e) { /* mail niet kritiek */ }

    } else if (action === 'reject') {
      await fetch(`${SUPABASE_URL}/rest/v1/panels?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
      });
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
