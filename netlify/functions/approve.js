exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'text/html'
  };

  try {
    const { id, action } = event.queryStringParameters || {};
    
    if (!id || !action) {
      return { statusCode: 400, headers, body: '<h2>Invalid request</h2>' };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (action === 'approve') {
      await fetch(
        `${SUPABASE_URL}/rest/v1/registrations?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'approved' })
        }
      );
      return {
        statusCode: 200,
        headers,
        body: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;text-align:center">
          <h2 style="color:green">✓ Deelnemer goedgekeurd!</h2>
          <p>De deelnemer is nu zichtbaar in de app.</p>
          <a href="https://app.unitedwoodfloorlayers.com">Open de app</a>
        </body></html>`
      };
    }

    if (action === 'reject') {
      await fetch(
        `${SUPABASE_URL}/rest/v1/registrations?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return {
        statusCode: 200,
        headers,
        body: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;text-align:center">
          <h2 style="color:red">✗ Deelnemer afgewezen en verwijderd.</h2>
          <a href="https://app.unitedwoodfloorlayers.com">Open de app</a>
        </body></html>`
      };
    }

    return { statusCode: 400, headers, body: '<h2>Unknown action</h2>' };

  } catch (err) {
    return { statusCode: 500, headers, body: `<h2>Error: ${err.message}</h2>` };
  }
};
