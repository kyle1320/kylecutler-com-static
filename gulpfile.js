const gulp = require('gulp');
const path = require('path');

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

gulp.task('styles-production', function () {
    return gulp.src('src/styles/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest(target('css')));
});

gulp.task('content-scripts-production', function () {
    return gulp.src('src/content/**/*.js')
        .pipe(babel())
        .pipe(uglify())
        .on('error', notify.onError(function (error) {
            return 'An error occured compiling a js source file: ' + error;
        }))
        .pipe(gulp.dest(target()));
});

gulp.task('site-scripts-production', function () {
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

gulp.task('deploy', [
    'styles-production',
    'content-scripts-production',
    'site-scripts-production',
    'content',
    'assets'
]);

gulp.task('default', ['deploy'], function() {
    browserSync.init("public/**/*", {
        server: {
            baseDir: "./public"
        }
    });

    gulp.watch([
        'src/**/*.pug'
    ], ['content']);

    gulp.watch([
        'src/content/**/*.js'
    ], ['content-scripts']);

    gulp.watch([
        'src/styles/**/*.scss'
    ], ['styles']);

    gulp.watch([
        'src/assets/**/*',
        'src/content/**/*',
        '!src/content/**/*.js',
        '!src/content/**/*.pug'
    ], ['assets']);
});