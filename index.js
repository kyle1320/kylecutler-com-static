const Express = require('express');
const path = require('path');

module.exports = {
  files: Express.static(path.join(__dirname, 'public')),
  handle404: function(req, res) {
    res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
  }
};