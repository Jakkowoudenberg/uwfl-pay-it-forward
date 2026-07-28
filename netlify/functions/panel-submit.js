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
      `${SUPABASE_URL}/rest/v1/registrations?select=name,company,country,email,participant_number&participant_number=eq.${pnr}`,
      { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } }
    );
    const rows = await checkResp.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return { statusCode: 403, headers, body: JSON.stringify({ ok: false, error: 'not_found' }) };
    }
    const reg = rows[0];
    // Staat er een e-mail op naam? Dan moet die exact kloppen (sterke check).
    // Staat er geen e-mail (veel vroege aanmeldingen), dan kunnen we niet
    // verifieren en laten we het door: de goedkeuring (pending -> approved)
    // door Jakko/Lenny is dan het vangnet tegen misbruik.
    if (reg.email && reg.email.trim()) {
      if (reg.email.trim().toLowerCase() !== email) {
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
      photos: JSON.stringify(photos),
      contact_email: (data.contact_email || '').trim() || null,
      contact_website: (data.contact_website || '').trim() || null,
      contact_phone: (data.contact_phone || '').trim() || null,
      status: 'pending'
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
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id: saved[0] && saved[0].id }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
