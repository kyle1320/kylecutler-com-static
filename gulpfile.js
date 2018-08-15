const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const path = require('path');
const pug = require('gulp-pug');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const notify = require('gulp-notify');

function target(fpath = '') {
    return path.join('public', fpath);
}

gulp.task('styles', function () {
    return gulp.src('src/styles/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .on('error', notify.onError(function (error) {
            return 'An error occured compiling an scss stylesheet: ' + error;
        }))
        .pipe(gulp.dest(target('css')));
});

gulp.task('scripts', function () {
    return gulp.src('src/content/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(minify({
            ext: {
                src: '.debug.js',
                min: '.js'
            }
        }))
        .on('error', notify.onError(function (error) {
            return 'An error occured compiling a js source file: ' + error;
        }))
        .pipe(gulp.dest(target()));
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

gulp.task('browser-sync', function() {
    browserSync.init("public/**/*", {
        server: {
            baseDir: "./public"
        }
    });
});

gulp.task('deploy', ['styles', 'scripts', 'content', 'assets']);

gulp.task('default', ['styles', 'scripts', 'content', 'assets', 'browser-sync'], function() {
    gulp.watch([
        'src/**/*.pug'
    ], ['content']);

    gulp.watch([
        'src/content/**/*.js'
    ], ['scripts']);

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