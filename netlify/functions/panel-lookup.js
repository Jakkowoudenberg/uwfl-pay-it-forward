'use strict';
const { endpoint, body, limit, recaptcha } = require('../lib/core');
const { participant } = require('../lib/participant');
exports.handler = endpoint('POST', async event => {
 limit(event, 12);
 const data = body(event);
 await recaptcha(data, 'lookup');
 const reg = await participant(data);
 return { ok:true, participant_number:reg.participant_number, name:reg.name || '', company:reg.company || '', country:reg.country || '' };
});
