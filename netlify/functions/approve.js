'use strict';
const { decision } = require('../lib/review');
exports.handler = decision('registrations');
