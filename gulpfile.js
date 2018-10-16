const gulp    = require('gulp');
const gulpIf  = require('gulp-if');
const log     = require('fancy-log');
const plumber = require('gulp-plumber');

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

const configPaths = {
  assets: {
    src: [
      'src/assets/**/*',
      'src/content/**/*',
      '!src/content/**/*.{js,ts}',
      '!src/content/**/*.pug'
    ],
    dest: 'public'
  },
  content: {
    src: ['src/content/**/*.pug'],
    dest: 'public',
    watch: ['src/**/*.pug']
  },
  contentScripts: {
    src: ['src/content/**/*.{js,ts}'],
    dest: 'public'
  },
  hiddenItems: {
    dev: [],
    prod: []
  },
  lint: ['src/**/*.{js,ts}'],
  siteScripts: {
    include: 'src/scripts/**/*.js',
    exclude: 'src/scripts/**/_*/**/*.js',
    dest: 'public/js'
  },
  styles: {
    src: ['src/styles/**/*.scss'],
    dest: 'public/css'
  },
  vendorScripts: {
    src: [
      {
        devSrc: 'node_modules/three/build/three.js',
        prodSrc: 'node_modules/three/build/three.min.js',
        targetName: 'three.js'
      },
      {
        devSrc: 'node_modules/jscolor-picker/jscolor.js',
        prodSrc: 'node_modules/jscolor-picker/jscolor.min.js',
        targetName: 'jscolor.js'
      }
    ],
    dest: 'public/js'
  }
};

const isProd     = ()         => process.env.NODE_ENV === 'production';
const prod       = (stream)   => gulpIf(isProd(), stream);
const dev        = (stream)   => gulpIf(!isProd(), stream);
const setUpTasks = (name, cb) => cb(configPaths[name]);

// don't handle errors in production builds -- just let Gulp crash.
const handleErrors = () => dev(plumber(e => log.error(e.toString())));

setUpTasks('styles', paths => {
  const autoprefixer = require('gulp-autoprefixer');
  const cleanCSS     = require('gulp-clean-css');
  const sass         = require('gulp-sass');
  const sourcemaps   = require('gulp-sourcemaps');

  gulp.task('styles', function () {
    return gulp.src(paths.src)
      .pipe(handleErrors())
      .pipe(dev(sourcemaps.init()))
      .pipe(sass())
      .pipe(autoprefixer())
      .pipe(prod(cleanCSS({compatibility: 'ie8'})))
      .pipe(dev(sourcemaps.write()))
      .pipe(gulp.dest(paths.dest));
  });

  gulp.task('watch:styles', function () {
    gulp.watch(paths.src, gulp.series('styles'));
  });
});

setUpTasks('contentScripts', paths => {
  const babel = require('gulp-babel');
  const uglify = require('gulp-uglify');

  gulp.task('content-scripts', function () {
    return gulp.src(paths.src)
      .pipe(handleErrors())
      .pipe(babel(babelConfig_noTransform))
      .pipe(prod(uglify()))
      .pipe(gulp.dest(paths.dest));
  });

  gulp.task('watch:content-scripts', function () {
    gulp.watch(paths.src, gulp.series('content-scripts'));
  });
});

setUpTasks('siteScripts', paths => {
  const babelify   = require('babelify');
  const browserify = require('browserify');
  const envify     = require('envify');
  const es         = require('event-stream');
  const glob       = require('glob');
  const path       = require('path');
  const source     = require('vinyl-source-stream');
  const tinyify    = require('tinyify');
  const watchify   = require('watchify');

  gulp.task('site-scripts', function (done) {
    getBundles(function (err, bundles) {
      if (err) done(err);

      es.merge(bundles.map(bundleSiteScripts)).on('end', done);
    });
  });

  gulp.task('watch:site-scripts', function (done) {
    getBundles(function (err, bundles) {
      if (err) done(err);

      es.merge(bundles.map(b => bundleSiteScripts(
        watchify(b).on('update', () => bundleSiteScripts(b))
      )));
    });
  });

  function getBundles(callback) {
    const browserifyArgs = Object.assign({},
      watchify.args,
      { debug: !isProd(), extensions: ['.js', '.ts'] }
    );

    const babelifyArgs = Object.assign({},
      babelConfig_withTransform,
      { extensions: ['.js', '.ts'] }
    );

    glob(paths.include, { ignore: paths.exclude }, function (err, files) {
      if (err) callback(err);

      callback(null, files.map(function (entry) {
        var bundler = browserify(entry, browserifyArgs)
          .transform(babelify, babelifyArgs)
          .transform(envify, { _: 'purge' });

        bundler._relPath = path.relative('src/scripts', entry);

        if (isProd()) {
          bundler = bundler.plugin(tinyify);
        }

        return bundler;
      }));
    });
  }

  function bundleSiteScripts(bundler) {
    return (function (b) {
      return isProd() ? b : b.on('error', e => log.error(e.toString()));
    }(bundler.bundle()))
      .pipe(source(bundler._relPath))
      .pipe(gulp.dest(paths.dest));
  }
});

setUpTasks('content', paths => {
  const babel   = require('@babel/core');
  const pug     = require('gulp-pug');
  const htmlmin = require('gulp-htmlmin');

  const pugArgs = {
    basedir: 'src/templates',
    globals: ['obfuscate'],
    filters: {
      babel: function (text) {
        return babel.transformSync(text, babelConfig_noTransform).code;
      }
    }
  };

  const htmlMinArgs = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true
  };

  global.obfuscate = function (attributes) {
    var attrs = {};
    for (var key in attributes) {
      attrs[key] = Buffer.from(attributes[key]).toString('base64');
    }
    return {'data-obf': attrs};
  };

  gulp.task('content', function () {
    return gulp.src(paths.src)
      .pipe(handleErrors())
      .pipe(pug(pugArgs))
      .pipe(prod(htmlmin(htmlMinArgs)))
      .pipe(gulp.dest(paths.dest));
  });

  gulp.task('watch:content', function () {
    gulp.watch(paths.watch, gulp.series('content'));
  });
});

setUpTasks('assets', paths => {
  gulp.task('assets', function () {
    return gulp.src(paths.src)
      .pipe(gulp.dest(paths.dest));
  });

  gulp.task('watch:assets', function () {
    gulp.watch(paths.src, gulp.series('assets'));
  });
});

setUpTasks('lint', paths => {
  const eslint = require('gulp-eslint');

  gulp.task('lint', function () {
    return gulp.src(paths)
      .pipe(handleErrors())
      .pipe(eslint({ extensions: ['.js', '.ts'] }))
      .pipe(eslint.format());
  });

  gulp.task('watch:lint', function () {
    gulp.watch(paths, gulp.series('lint'));
  });
});

setUpTasks('vendorScripts', paths => {
  const rename = require('gulp-rename');

  function vendorScript(def) {
    const task = function () {
      return gulp.src(isProd() ? def.prodSrc : def.devSrc)
        .pipe(handleErrors())
        .pipe(rename(def.targetName))
        .pipe(gulp.dest(paths.dest));
    };

    task.displayName = 'vendor:' + def.targetName;

    return task;
  }

  gulp.task('vendor', gulp.parallel(paths.src.map(vendorScript)));
});

setUpTasks('hiddenItems', paths => {
  const del = require('del');

  gulp.task('hidden-items', function () {
    return del(isProd() ? paths.prod : paths.dev);
  });
});

setUpTasks('extras', () => {
  const browserSync = require('browser-sync');
  const del         = require('del');

  gulp.task('clean', function () {
    return del('public');
  });

  gulp.task('watch', gulp.parallel(
    'watch:content',
    'watch:content-scripts',
    'watch:site-scripts',
    'watch:styles',
    'watch:assets',
    'watch:lint'
  ));

  gulp.task('browser-sync', function (done) {
    browserSync('public/**/*', { server: { baseDir: './public' } }, done);
  });
});

setUpTasks('build', () => {
  gulp.task('build', gulp.series(
    'clean',
    gulp.parallel(
      'lint',
      'styles',
      'content-scripts',
      'site-scripts',
      'content',
      'assets',
      'vendor'
    ),
    'hidden-items'
  ));

  gulp.task('build:dev', gulp.series(
    setEnv('development'),
    'build'
  ));

  gulp.task('build:prod', gulp.series(
    setEnv('production'),
    'build'
  ));

  function setEnv(name) {
    const task = function (done) {
      process.env.NODE_ENV = name;
      done();
    };

    task.displayName = 'setEnv:' + name;

    return task;
  }
});

gulp.task('default', gulp.series(
  'build:dev',
  gulp.parallel('watch', 'browser-sync')
));