const Express = require('express');
const path = require('path');
const fs = require('fs');

const router = new Express.Router();

// Search for any modules to load.
// Modules must be contained within a directory whose name will be used
// for routing, and must export an Express middleware function.
fs.readdirSync(__dirname)
    .filter(file => fs.lstatSync(path.join(__dirname, file)).isDirectory())
    .forEach(file => router.use('/'+file, require(path.join(__dirname, file))));

module.exports = router;