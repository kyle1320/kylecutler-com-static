const express = require('express');
const modules = require('./modules');

var app = express();

// static files always come first
app.use(express.static('public'));

// then route to any additional modules
app.use('/', modules);

app.listen(process.env.PORT || 3000);