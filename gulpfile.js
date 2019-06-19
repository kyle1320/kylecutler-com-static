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
const scripts = `src/**/*.{${extensionsNoDot.join(',')}}`;

const isProd = ()       => process.env.NODE_ENV === 'production';
const prod   = (stream) => $.if(isProd(), stream);
const dev    = (stream) => $.if(!isProd(), stream);

// don't handle errors in production builds -- just let Gulp crash.
const handleErrors = () => dev($.plumber(e => log.error(e.toString())));

gulp.task('content', function () {
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
      baseDir: 'src/content',
      html: src => src
        .pipe(prod($.htmlmin({
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
          removeComments: true
        }))),
      script: src => src
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
        .pipe(dev($.sourcemaps.write())),
      style: src => src
        .pipe(dev($.sourcemaps.init()))
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.autoprefixer({ grid: true }))
        .pipe(prod($.cleanCss({compatibility: 'ie8'})))
        .pipe(dev($.sourcemaps.write()))
    }))
    .pipe(gulp.dest('public'));
});

gulp.task('watch:content', function () {
  gulp.watch('src/{templates,content}/**/*', gulp.series('content'));
});

gulp.task('assets', function () {
  return gulp.src('src/assets/**/*').pipe(gulp.dest('public'));
});

gulp.task('watch:assets', function () {
  gulp.watch('src/assets/**/*', gulp.series('assets'));
});

gulp.task('lint', function () {
  return gulp.src(scripts)
    .pipe($.cached('linter', { optimizeMemory: true }))
    .pipe(handleErrors())
    .pipe($.eslint({ extensions }))
    .pipe($.eslint.format());
});

gulp.task('watch:lint', function () {
  gulp.watch(scripts, gulp.series('lint'));
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
  gulp.parallel('watch:content', 'watch:assets', 'watch:lint'));

gulp.task('browser-sync', function (done) {
  browserSync('public/**/*', { server: { baseDir: './public' } }, done);
});

const build = gulp.parallel('assets', 'content');

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
