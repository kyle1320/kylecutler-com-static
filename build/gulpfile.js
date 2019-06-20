const gulp        = require('gulp');
const browserSync = require('browser-sync');
const del         = require('del');

const {
  $,
  extensions,
  extensionsNoDot,
  handleErrors,
  dirs } = require('./util');
const {
  html,
  stylesAuto,
  scriptsAuto,
  stylesManual,
  scriptsManual } = require('./content');

const allScripts = `${dirs.source}/**/*.{${extensionsNoDot.join(',')}}`;

gulp.task('content', gulp.series(
  html,
  gulp.parallel(stylesAuto, scriptsAuto)
));

// content task may trigger styles & scripts, but we still need to
// watch for changes to styles & scripts independently
gulp.task('watch:content', function () {
  gulp.watch(
    `${dirs.source}/{${dirs.templates},${dirs.content}}/**/*.pug`,
    gulp.series('content')
  );
  gulp.watch(
    `${dirs.source}/${dirs.content}/**/*.scss`,
    gulp.series(stylesManual)
  );
  gulp.watch(allScripts, gulp.series(scriptsManual));
});

gulp.task('assets', function () {
  return gulp.src(`${dirs.source}/${dirs.assets}/**/*`)
    .pipe(gulp.dest(dirs.target));
});

gulp.task('watch:assets', function () {
  gulp.watch(`${dirs.source}/${dirs.assets}/**/*`, gulp.series('assets'));
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
  return gulp.src(`${dirs.target}/**/*.html`, { read: false })
    .pipe($.sitemap({
      siteUrl: 'https://www.kylecutler.com',
      changefreq: 'monthly'
    }))
    .pipe(gulp.dest(`${dirs.target}`));
});

gulp.task('clean', function () {
  return del(dirs.target);
});

gulp.task('watch',
  gulp.parallel('watch:content', 'watch:assets', 'watch:lint'));

gulp.task('browser-sync', function (done) {
  browserSync(
    `${dirs.target}/**/*`,
    { server: { baseDir: `./${dirs.target}` } },
    done
  );
});

const build = gulp.parallel('assets', 'content');

gulp.task('build', gulp.series(
  function setProduction(done) {
    process.env.NODE_ENV = 'production';
    done();
  },
  'clean', build, 'sitemap'
));

gulp.task('default', gulp.series(
  'clean',
  gulp.parallel(build, 'lint'),
  gulp.parallel('watch', 'browser-sync')
));