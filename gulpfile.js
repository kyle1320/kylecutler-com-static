const gulp = require('gulp');
const less = require('gulp-less');
const babel = require('gulp-babel');
const path = require('path');
const nunjucksRender = require('gulp-nunjucks-render');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');

function target(fpath = '') {
    return path.join('public', fpath);
}

gulp.task('static', function () {
    return gulp.src('src/static/**/*')
        .pipe(gulp.dest(target()));
});

gulp.task('compile-js', function () {
    return gulp.src('src/compile/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(minify({
            ext: {
                src: '.debug.js',
                min: '.js'
            }
        }))
        .pipe(gulp.dest(target()));
});

gulp.task('compile-less', function () {
    return gulp.src(['src/compile/**/*.less', '!src/compile/**/_*.less'])
        .pipe(less())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest(target()));
});

gulp.task('compile-css', function () {
    return gulp.src('src/compile/**/*.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest(target()));
});

gulp.task('compile-njk', function () {
    return gulp.src('src/compile/**/*.njk')
        .pipe(nunjucksRender({
            path: ['src/resources/templates']
        }))
        .pipe(gulp.dest(target()));
});

gulp.task('compile-misc', function () {
    return gulp.src([
        'src/compile/**/*',
        '!src/compile/**/*.js',
        '!src/compile/**/*.less',
        '!src/compile/**/*.css',
        '!src/compile/**/*.njk'
        ]).pipe(gulp.dest(target()));
})

gulp.task('compile', ['compile-js', 'compile-less', 'compile-css', 'compile-njk', 'compile-misc']);

// default task watches for changes to files and updates the target
gulp.task('default', ['compile', 'static'], function() {
    gulp.watch(['src/compile/**/*', 'src/resources/**/*'], ['compile']);
    gulp.watch('src/static/**/*', ['static']);
});