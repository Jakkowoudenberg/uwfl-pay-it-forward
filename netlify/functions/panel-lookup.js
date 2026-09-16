'use strict';
const { endpoint, body, limit } = require('../lib/core');
const { participant } = require('../lib/participant');
exports.handler = endpoint('POST', async event => {
 limit(event, 12);
 const reg = await participant(body(event));
 return { ok:true, participant_number:reg.participant_number, name:reg.name || '', company:reg.company || '', country:reg.country || '' };
});
