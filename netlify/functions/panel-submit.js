exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    const data = JSON.parse(event.body || '{}');

    // ---- 1. Koppeling controleren: nummer + e-mail moeten bij dezelfde deelnemer horen ----
    const pnr = parseInt(data.participant_number, 10);
    const email = (data.email || '').trim().toLowerCase();
    if (!pnr || !email) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'missing_credentials' }) };
    }

    const checkResp = await fetch(
      `${SUPABASE_URL}/rest/v1/registrations?select=name,company,country,email,participant_number,upload_without_email&participant_number=eq.${pnr}`,
      { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } }
    );
    const rows = await checkResp.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return { statusCode: 403, headers, body: JSON.stringify({ ok: false, error: 'not_found' }) };
    }
    const reg = rows[0];
    // E-mail moet exact kloppen. Uitzondering: een vaste groep bestaande
    // deelnemers zonder e-mail op bestand is eenmalig gemarkeerd
    // (upload_without_email) en mag uploaden met alleen het nummer. Iedereen
    // die zich vanaf nu aanmeldt heeft een e-mail en valt hier niet onder.
    if (!reg.upload_without_email) {
      if (!reg.email || reg.email.trim().toLowerCase() !== email) {
        return { statusCode: 403, headers, body: JSON.stringify({ ok: false, error: 'email_mismatch' }) };
      }
    }

    // ---- 2. Verplichte velden ----
    const photos = Array.isArray(data.photos) ? data.photos.filter(function(u){ return typeof u === 'string' && u; }) : [];
    const artwork = (data.artwork_name || '').trim();
    const story = (data.story || '').trim();
    if (!artwork || !story || photos.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'missing_required' }) };
    }

    // Naam splitsen voor de automatisch-gevulde velden (val terug op de aanmelding)
    var fn = (data.first_name || '').trim();
    var ln = (data.last_name || '').trim();
    if (!fn && !ln && reg.name) {
      var parts = reg.name.trim().split(/\s+/);
      fn = parts.shift() || '';
      ln = parts.join(' ');
    }

    // ---- 3. Opslaan als pending ----
    const row = {
      participant_number: pnr,
      first_name: fn || null,
      last_name: ln || null,
      company: (data.company || reg.company || '').trim() || null,
      nationality: (data.nationality || '').trim() || null,
      country_made: (data.country_made || reg.country || '').trim() || null,
      place_made: (data.place_made || '').trim() || null,
      production_date: (data.production_date || '').trim() || null,
      artwork_name: artwork,
      wood_species: (data.wood_species || '').trim() || null,
      pattern: (data.pattern || '').trim() || null,
      story: story,
      photos: photos,
      contact_email: (data.contact_email || '').trim() || null,
      contact_website: (data.contact_website || '').trim() || null,
      contact_phone: (data.contact_phone || '').trim() || null,
      status: 'pending',
      submitter_email: email || null,
      lang: (data.lang || 'en')
    };

    const insertResp = await fetch(
      `${SUPABASE_URL}/rest/v1/panels`,
      {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(row)
      }
    );

    if (!insertResp.ok) {
      const err = await insertResp.text();
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'insert_failed', detail: err }) };
    }

    const saved = await insertResp.json();

    // Bevestigingsmails via het Google Apps Script (net als bij de aanmelding).
    // type:'panel' laat het script de paneel-mails sturen (naar UWFL en de
    // maker) i.p.v. de aanmeld-mails. Mail is niet kritiek: faalt dit, dan
    // is het paneel toch opgeslagen.
    try {
      await fetch('https://script.google.com/macros/s/AKfycbzWD7r75jPpEdAwyTjHHyGYB_WGApbLribkRIXhdchkjRF48W7TeeStunHldq1ybtKG/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'panel',
          naam: ((row.first_name || '') + ' ' + (row.last_name || '')).trim(),
          email: email,
          lang: (data.lang || 'en'),
          participant_number: pnr,
          artwork_name: row.artwork_name,
          company: row.company || '',
          country: row.country_made || '',
          place: row.place_made || '',
          wood: row.wood_species || '',
          pattern: row.pattern || ''
        })
      });
    } catch (e) { /* mail niet kritiek */ }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id: saved[0] && saved[0].id }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
