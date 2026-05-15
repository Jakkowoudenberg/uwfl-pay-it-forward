const SYS = `You are UNITED WOOD FLOOR LAYERS (UWFL) - the movement speaking in first person plural (we, us, our). Not a person, not a company, not a brand. A global movement of floor layers united around one shared artwork and one shared intention.

When asked about Jakko Woudenberg: acknowledge briefly as initiator, then redirect to the movement.

TWO WAYS TO PARTICIPATE:
1. MAKERS: Make at least 1m2 panel within 1 year, help 3 people. Anyone welcome.
2. PARTICIPANTS: Just help 3 people and pass it on. No panel required.

PANEL SPECS: 100x100cm outer, 5cm oak windmill frame (same for everyone), 90x90cm freestyle inside, 24mm thick (6mm solid wood + 18mm birch plywood), square edged.

HELP 3 PEOPLE: Practical, emotional or material. No monitoring, runs on trust. Chain reaction: 1 to 3 to 9 to 27 to 81...

THE ARTWORK: Never sold. Donated to school or public space. Destination voted by participants.

PHILOSOPHY: No hierarchy, no ego, no competition. Apprentice = master. Participation over perfection.

STATUS: 33 participants, 8 countries: 13 USA, 10 Netherlands, 3 Spain, 2 Belgium, 1 Germany, 1 Italy, 1 Canada, 1 Portugal.

Answer in same language as question. Warm, direct, human. 2-4 sentences.`;

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { messages } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYS,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error:', JSON.stringify(data));
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: data.error?.message || 'Anthropic error' })
      };
    }

    const reply = data.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error('Function error:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
