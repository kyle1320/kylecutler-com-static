const log = require('fancy-log');
const $ = require('gulp-load-plugins')({ camelize: true });

const extensionsNoDot = ['js', 'ts', 'jsx', 'tsx'];
const extensions = extensionsNoDot.map(x => '.' + x);

const isProd = ()       => process.env.NODE_ENV === 'production';
const prod   = (stream) => $.if(isProd(), stream);
const dev    = (stream) => $.if(!isProd(), stream);

// don't handle errors in production builds -- just let Gulp crash.
const handleErrors = () => dev($.plumber(e => log.error(e.toString())));

const dirs = {
  source: 'src',
  target: 'public',

  assets: 'assets',
  content: 'content',
  template: 'templates',
};

module.exports = {
  $, extensions, extensionsNoDot, isProd, dev, prod, handleErrors, dirs
};