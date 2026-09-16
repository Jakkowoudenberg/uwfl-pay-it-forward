'use strict';
const { endpoint } = require('../lib/core');
const submissions = require('../lib/submissions');
exports.handler = endpoint('POST', submissions.register);
