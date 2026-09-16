'use strict';
const { upload } = require('../lib/images');
const { participant } = require('../lib/participant');
exports.handler = upload('panel-photos', participant);
