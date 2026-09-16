'use strict';
const { upload } = require('../lib/images');
exports.handler = upload('sponsor-logos');
