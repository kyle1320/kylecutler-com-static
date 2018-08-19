const gulp = require('gulp');
const path = require('path');
const del = require('del');

const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const browserSync = require('browser-sync');
const cleanCSS = require('gulp-clean-css');
const notify = require('gulp-notify');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

const babelify = require('babelify');
const browserify = require('browserify');
const tinyify = require('tinyify');
const watchify = require('watchify');

const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

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
    return gulp.src('src/content/**/*.js')
        .pipe(babel())
        .on('error', notify.onError(function (error) {
            return 'An error occured compiling a js source file: ' + error;
        }))
        .pipe(gulp.dest(target()));
});

gulp.task('site-scripts', function () {
    var args = Object.assign({}, watchify.args, { debug: true });
    var bundler = watchify(browserify('./src/scripts/site.js', args))
        .transform(babelify);

    bundler.on('update', function () {
      bundleSiteScripts(bundler);
    });

    return bundleSiteScripts(bundler);
});

function bundleSiteScripts(bundler) {
    return bundler
        .bundle()
        .on('error', notify.onError(function (error) {
            return 'An error occured compiling a js source file: ' + error;
        }))
        .pipe(source("site.js"))
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
    return gulp.src('src/content/**/*.js')
        .pipe(babel())
        .pipe(uglify())
        .on('error', notify.onError(function (error) {
            return 'An error occured compiling a js source file: ' + error;
        }))
        .pipe(gulp.dest(target()));
});

gulp.task('site-scripts:prod', function () {
    return browserify('./src/scripts/site.js')
        .transform(babelify)
        .plugin(tinyify)
        .bundle()
        .on('error', notify.onError(function (error) {
            return 'An error occured compiling a js source file: ' + error;
        }))
        .pipe(source("site.js"))
        .pipe(buffer())
        .pipe(gulp.dest(target('js')));
});

global.obfuscate = function (attributes) {
    var attrs = {};
    for (var key in attributes) {
        attrs[key] = Buffer.from(attributes[key]).toString('base64');
    }
    return {'data-obf': attrs};
}

gulp.task('content', function () {
    return gulp.src('src/content/**/*.pug')
        .pipe(pug({
            basedir: 'src/templates',
            globals: ['obfuscate']
        }))
        .on('error', notify.onError(function (error) {
            return 'An error occured compiling a pug template: ' + error;
        }))
        .pipe(gulp.dest(target()));
});

gulp.task('assets', function () {
    return gulp.src(['src/assets/**/*', 'src/content/**/*', '!src/content/**/*.js', '!src/content/**/*.pug'])
        .pipe(gulp.dest(target()));
});

gulp.task('watch:content', function () {
    gulp.watch([
        'src/**/*.pug'
    ], gulp.series('content'));
});

gulp.task('watch:content-scripts', function () {
    gulp.watch([
        'src/content/**/*.js'
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
        '!src/content/**/*.js',
        '!src/content/**/*.pug'
    ], gulp.series('assets'));
})

gulp.task('watch', gulp.parallel(
    'watch:content',
    'watch:content-scripts',
    'watch:styles',
    'watch:assets'
));

gulp.task('browser-sync', function (done) {
    browserSync("public/**/*", {
        server: {
            baseDir: "./public"
        }
    }, done);
});

gulp.task('clean', function () {
    return del('public');
});

gulp.task('build', gulp.series(
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
    'clean',
    gulp.parallel(
        'styles:prod',
        'content-scripts:prod',
        'site-scripts:prod',
        'content',
        'assets'
    )
));

gulp.task('default', gulp.series(
    'build',
    gulp.parallel('watch', 'browser-sync')
));