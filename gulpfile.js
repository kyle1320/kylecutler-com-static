const gulp = require('gulp');
const path = require('path');
const del = require('del');
const glob = require('glob');
const es = require('event-stream');

const babelCore = require('@babel/core');

const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const browserSync = require('browser-sync');
const cleanCSS = require('gulp-clean-css');
const eslint = require('gulp-eslint');
const htmlmin = require('gulp-htmlmin');
const notify = require('gulp-notify');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

const babelify = require('babelify');
const browserify = require('browserify');
const envify = require('envify');
const eslintify = require('eslintify');
const tinyify = require('tinyify');
const watchify = require('watchify');

const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

const babelConfig_noTransform = {
  'presets': [
    '@babel/preset-env', '@babel/preset-typescript'
  ]
};

const babelConfig_withTransform = {
  'presets': [
    '@babel/preset-env', '@babel/preset-typescript'
  ],
  'plugins': [
    ['@babel/plugin-transform-runtime', {
      corejs: 2
    }]
  ]
};

function target(fpath = '') {
  return path.join('public', fpath);
}

gulp.task('styles', function () {
  return gulp.src('src/styles/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(target('css')));
});

gulp.task('content-scripts', function () {
  return gulp.src('src/content/**/*.{js,ts}')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(babel(babelConfig_noTransform))
    .on('error', notify.onError(function (error) {
      return 'An error occured compiling a js source file: ' + error;
    }))
    .pipe(gulp.dest(target()));
});

gulp.task('site-scripts', function (done) {

  // eslint-disable-next-line max-len
  glob('{src/scripts/site.js,src/scripts/standalone/*.js}', function (err, files) {
    if (err) done(err);

    var tasks = files.map(function (entry) {
      var args = Object.assign({}, watchify.args, {
        debug: true,
        extensions: ['.js', '.ts']
      });
      var bundler = watchify(browserify(entry, args))
        .transform(eslintify)
        .transform(babelify, Object.assign({},
          babelConfig_withTransform,
          { extensions: ['.js', '.ts'] }
        ))
        .transform(envify, { _: 'purge' });
      var relPath = path.relative('src/scripts', entry);

      bundler.on('update', function () {
        bundleSiteScripts(bundler, relPath);
      });

      return bundleSiteScripts(bundler, relPath);
    });

    es.merge(tasks).on('end', done);
  });
});

function bundleSiteScripts(bundler, filename) {
  return bundler
    .bundle()
    .on('error', notify.onError(function (error) {
      return 'An error occured compiling a js source file: ' + error;
    }))
    .pipe(source(filename))
    .pipe(buffer())
    .pipe(gulp.dest(target('js')));
}

gulp.task('styles:prod', function () {
  return gulp.src('src/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(target('css')));
});

gulp.task('content-scripts:prod', function () {
  return gulp.src('src/content/**/*.{js,ts}')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(babel(babelConfig_noTransform))
    .pipe(uglify())
    .on('error', notify.onError(function (error) {
      return 'An error occured compiling a js source file: ' + error;
    }))
    .pipe(gulp.dest(target()));
});

gulp.task('site-scripts:prod', function (done) {

  // eslint-disable-next-line max-len
  glob('{src/scripts/site.js,src/scripts/standalone/*.js}', function (err, files) {
    if (err) done(err);

    var tasks = files.map(function (entry) {
      var relPath = path.relative('src/scripts', entry);

      return browserify(entry, { extensions: ['.js', '.ts'] })
        .transform(eslintify)
        .transform(babelify, Object.assign({},
          babelConfig_withTransform,
          { extensions: ['.js', '.ts'] }
        ))
        .transform(envify, { _: 'purge' })
        .plugin(tinyify)
        .bundle()
        .on('error', notify.onError(function (error) {
          return 'An error occured compiling a js source file: ' + error;
        }))
        .pipe(source(relPath))
        .pipe(buffer())
        .pipe(gulp.dest(target('js')));
    });

    es.merge(tasks).on('end', done);
  });
});

global.obfuscate = function (attributes) {
  var attrs = {};
  for (var key in attributes) {
    attrs[key] = Buffer.from(attributes[key]).toString('base64');
  }
  return {'data-obf': attrs};
};

gulp.task('content', function () {
  return gulp.src('src/content/**/*.pug')
    .pipe(pug({
      basedir: 'src/templates',
      globals: ['obfuscate'],
      filters: {
        babel: function (text) {
          return babelCore.transformSync(text, babelConfig_noTransform).code;
        }
      }
    }))
    .on('error', notify.onError(function (error) {
      return 'An error occured compiling a pug template: ' + error;
    }))
    .pipe(htmlmin({
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true
    }))
    .pipe(gulp.dest(target()));
});

gulp.task('assets', function () {
  return gulp.src([
    'src/assets/**/*',
    'src/content/**/*',
    '!src/content/**/*.{js,ts}',
    '!src/content/**/*.pug'
  ]).pipe(gulp.dest(target()));
});

gulp.task('hidden-items:prod', function (done) {
  done(); // return del(['public/circuits']);
});

gulp.task('watch:content', function () {
  gulp.watch([
    'src/**/*.pug'
  ], gulp.series('content'));
});

gulp.task('watch:content-scripts', function () {
  gulp.watch([
    'src/content/**/*.{js,ts}'
  ], gulp.series('content-scripts'));
});

gulp.task('watch:styles', function () {
  gulp.watch([
    'src/styles/**/*.scss'
  ], gulp.series('styles'));
});

gulp.task('watch:assets', function () {
  gulp.watch([
    'src/assets/**/*',
    'src/content/**/*',
    '!src/content/**/*.{js,ts}',
    '!src/content/**/*.pug'
  ], gulp.series('assets'));
});

gulp.task('watch', gulp.parallel(
  'watch:content',
  'watch:content-scripts',
  'watch:styles',
  'watch:assets'
));

gulp.task('browser-sync', function (done) {
  browserSync('public/**/*', {
    server: {
      baseDir: './public'
    }
  }, done);
});

gulp.task('clean', function () {
  return del('public');
});

gulp.task('build', gulp.series(
  function setDevEnv(done) {
    process.env.NODE_ENV = 'development';
    done();
  },
  'clean',
  gulp.parallel(
    'styles',
    'content-scripts',
    'site-scripts',
    'content',
    'assets'
  )
));

gulp.task('build:prod', gulp.series(
  function setProdEnv(done) {
    process.env.NODE_ENV = 'production';
    done();
  },
  'clean',
  gulp.parallel(
    'styles:prod',
    'content-scripts:prod',
    'site-scripts:prod',
    'content',
    'assets'
  ),
  'hidden-items:prod'
));

gulp.task('default', gulp.series(
  'build',
  gulp.parallel('watch', 'browser-sync')
));