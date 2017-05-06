const express = require('express');
const groupme = require('./groupme-bot');

var app = express();

app.use(express.static('public'));

app.use('/groupme', groupme);

app.listen(process.env.PORT || 3000);