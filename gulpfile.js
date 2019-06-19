const gulp        = require('gulp');
const log         = require('fancy-log');
const browserSync = require('browser-sync');
const del         = require('del');
const $           = require('gulp-load-plugins')({ camelize: true });

const replace     = require('rollup-plugin-replace');
const resolve     = require('rollup-plugin-node-resolve');
const typescript  = require('rollup-plugin-typescript');
const uglify      = require('rollup-plugin-uglify');

const htmlDep     = require('./lib/htmlAssets');


const extensionsNoDot = ['js', 'ts', 'jsx', 'tsx'];
const extensions = extensionsNoDot.map(x => '.' + x);
const allScripts = `src/**/*.{${extensionsNoDot.join(',')}}`;

const isProd = ()       => process.env.NODE_ENV === 'production';
const prod   = (stream) => $.if(isProd(), stream);
const dev    = (stream) => $.if(!isProd(), stream);

// don't handle errors in production builds -- just let Gulp crash.
const handleErrors = () => dev($.plumber(e => log.error(e.toString())));

var scripts = new Set(), styles = new Set();

gulp.task('content', function () {
  const newScripts = new Set(), newStyles = new Set();

  return gulp.src('src/content/**/*.pug')
    .pipe(handleErrors())
    .pipe($.pug({
      basedir: 'src/templates',
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
      onScript: path => newScripts.add(path),
      onStyle: path => newStyles.add(path),
      baseDir: 'src/content'
    }))
    .pipe(prod($.htmlmin({
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true
    })))
    .on('end', function () {
      styles = newStyles;
      scripts = newScripts;
    })
    .pipe(gulp.dest('public'));
});

gulp.task('watch:content', function () {
  gulp.watch('src/{templates,content}/**/*.pug', gulp.series('content'));
});

gulp.task('scripts', function () {
  return gulp.src([...scripts], { base: 'src/content' })
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
    .pipe(gulp.dest('public'));
});

gulp.task('watch:scripts', function () {

  // TODO: watch for updates to scripts map
  gulp.watch(allScripts, gulp.series('scripts'));
});

gulp.task('styles', function () {
  return gulp.src([...styles], { base: 'src/content' })
    .pipe(dev($.sourcemaps.init()))
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.autoprefixer({ grid: true }))
    .pipe(prod($.cleanCss({compatibility: 'ie8'})))
    .pipe(dev($.sourcemaps.write()))
    .pipe(gulp.dest('public'));
});

gulp.task('watch:styles', function () {

  // TODO: watch for updates to styles map
  gulp.watch('src/content/**/*.scss', gulp.series('styles'));
});

gulp.task('assets', function () {
  return gulp.src('src/assets/**/*').pipe(gulp.dest('public'));
});

gulp.task('watch:assets', function () {
  gulp.watch('src/assets/**/*', gulp.series('assets'));
});

gulp.task('lint', function () {
  return gulp.src(allScripts)
    .pipe($.cached('linter', { optimizeMemory: true }))
    .pipe(handleErrors())
    .pipe($.eslint({ extensions }))
    .pipe($.eslint.format());
});

gulp.task('watch:lint', function () {
  gulp.watch(allScripts, gulp.series('lint'));
});

gulp.task('sitemap', function () {
  return gulp.src('public/**/*.html', { read: false })
    .pipe($.sitemap({
      siteUrl: 'https://www.kylecutler.com',
      changefreq: 'monthly'
    }))
    .pipe(gulp.dest('public'));
});

gulp.task('clean', function () {
  return del('public');
});

gulp.task('watch',
  gulp.parallel(
    'watch:content',
    'watch:assets',
    'watch:styles',
    'watch:scripts',
    'watch:lint'
  )
);

gulp.task('browser-sync', function (done) {
  browserSync('public/**/*', { server: { baseDir: './public' } }, done);
});

const build = gulp.series(
  gulp.parallel('assets', 'content'),
  gulp.parallel('scripts', 'styles'),
);

gulp.task('build',
  gulp.series(setEnv('production'), 'clean', build, 'sitemap'));

gulp.task('default', gulp.series(
  'clean',
  gulp.parallel(build, 'lint'),
  gulp.parallel('watch', 'browser-sync')
));

function setEnv(name) {
  const task = function (done) {
    process.env.NODE_ENV = name;
    done();
  };

  task.displayName = 'setEnv:' + name;

  return task;
}
