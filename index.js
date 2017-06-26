const Express = require('express');
const path = require('path');

module.exports = Express.static(path.join(__dirname, 'public'));