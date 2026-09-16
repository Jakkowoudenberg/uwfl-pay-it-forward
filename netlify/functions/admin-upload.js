'use strict';
// Retire the legacy name-based overwrite of an already public participant photo.
// New uploads go through private storage and a new reviewed submission.
const { endpoint, fail } = require('../lib/core');
exports.handler = endpoint('POST', async () => { fail(410,'resubmit_for_review'); }, true);
