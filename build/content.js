const gulp = require('gulp');

const replace    = require('rollup-plugin-replace');
const resolve    = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript');
const uglify     = require('rollup-plugin-uglify');

const {
  $,
  extensions,
  handleErrors,
  prod,
  dev,
  isProd,
  dirs } = require('./util');
const htmlDep = require('./htmlAssets');

// Scripts & styles are pulled from html pages.
// Keep track of them globally so they can be shared between Gulp tasks.
var
  scripts = new Set(),
  scriptsUpdated = false,
  styles = new Set(),
  stylesUpdated = false;

function html() {
  var newScripts = new Set(), newStyles = new Set();

  function addScript(path) {
    newScripts.add(path);

    scriptsUpdated = scriptsUpdated || !scripts.has(path);
  }

  function addStyle(path) {
    newStyles.add(path);

    stylesUpdated = stylesUpdated || !styles.has(path);
  }

  function updateScriptsAndStyles() {

    // Uncomment to recompile scripts / styles upon removal.
    // This shouldn't be necessary -- we'll just have some unneeded files.
    //
    // stylesUpdated |= stylesUpdated || styles.size !== newStyles.size;
    // scriptsUpdated = scriptsUpdated || scripts.size !== newScripts.size;

    styles = newStyles;
    scripts = newScripts;
  }

  return gulp.src(`${dirs.source}/${dirs.content}/**/*.pug`)
    .pipe(handleErrors())
    .pipe($.pug({
      basedir: `${dirs.source}/${dirs.template}`,
      locals: {
        __DEBUG__: !isProd(),
        obfuscate: function obfuscate(attributes) {
          var attrs = {};
          for (var key in attributes) {
            attrs[key] = Buffer.from(attributes[key]).toString('base64');
          }
          return {'data-obf': attrs};
        }
      }
    }))
    .pipe(htmlDep({
      rename: function (path) {
        switch (path.ext) {
        case '.ts':
        case '.jsx':
        case '.tsx': path.ext = '.js'; break;
        case '.scss': path.ext = '.css'; break;
        }
      },
      onScript: addScript,
      onStyle: addStyle,
      baseDir: `${dirs.source}/${dirs.content}`
    }))
    .pipe(prod($.htmlmin({
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true
    })))
    .on('end', updateScriptsAndStyles)
    .pipe(gulp.dest(dirs.target));
}

function doStyles(auto, done) {
  if (auto && !stylesUpdated) return done();
  stylesUpdated = false;

  return gulp.src([...styles], { base: `${dirs.source}/${dirs.content}` })
    .pipe(dev($.sourcemaps.init()))
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.autoprefixer({ grid: true }))
    .pipe(prod($.cleanCss({compatibility: 'ie8'})))
    .pipe(dev($.sourcemaps.write()))
    .pipe(gulp.dest(dirs.target));
}

function doScripts(auto, done) {
  if (auto && !scriptsUpdated) return done();
  scriptsUpdated = false;

  return gulp.src([...scripts], { base: `${dirs.source}/${dirs.content}` })
    .pipe(dev($.sourcemaps.init()))
    .pipe($.betterRollup({
      cache: true,
      plugins: [
        resolve({ extensions }),
        replace({ __DEBUG__: !isProd() }),
        typescript({ include: extensions.map(x => '**/*' + x) })
      ].concat(isProd() ? uglify.uglify() : [])
    }, 'iife'))
    .pipe($.rename({ extname: '.js' }))
    .pipe(dev($.sourcemaps.write()))
    .pipe(gulp.dest(dirs.target));
}

module.exports = {
  html,
  stylesAuto:    function styles(done)  { return doStyles(true, done); },
  scriptsAuto:   function scripts(done) { return doScripts(true, done); },
  stylesManual:  function styles(done)  { return doStyles(false, done); },
  scriptsManual: function scripts(done) { return doScripts(false, done); }
};