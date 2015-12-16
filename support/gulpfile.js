'use strict';

var gulp     = require('gulp'),
    jshint   = require('gulp-jshint'),
    htmlhint = require('gulp-htmlhint'),
    filter   = require('gulp-filter'),
    csslint  = require('gulp-csslint'),
    zip      = require('gulp-zip');

var config = {
    base: "../",
    projectFiles: ['../**/*', '!../support/**', '!../js/libraries/**'],
    releaseFiles: [
        '../_locales/**/*',
        '../css/**/*',
        '../images/**/*',
        '../js/**/*',
        '../resources/**/*',
        '../tabs/**/*',
        '../*.js',
        '../*.css',
        '../*.html',
        '../*.json'
    ]
};

/**
 * validate js files
 */
gulp.task('validate_js', function () {
    return gulp.src(config.projectFiles)
        .pipe(filter("**/*.js"))
        .pipe(jshint("./.jshintrc"))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});


/**
 * validate html files
 */
gulp.task('validate_html', function () {
    return gulp.src(config.projectFiles)
        .pipe(filter("**/*.html"))
        .pipe(htmlhint())
        .pipe(htmlhint.reporter("htmlhint-stylish"))
        .pipe(htmlhint.failReporter());
});

/**
 * validate html files
 */
gulp.task('validate_css', function () {
    return gulp.src(config.projectFiles)
        .pipe(filter("**/*.css"))
        .pipe(csslint("csslintrc.json"))
        .pipe(csslint.reporter());
});

/**
 * Packages all relevant files for a Chrome App release
 */
gulp.task('package', function() {
    return gulp.src(config.releaseFiles,{base:config.base})
        .pipe(zip("chrome_app_release.zip"))
        .pipe(gulp.dest("./"));
});

gulp.task('validate', ['validate_css', 'validate_html', 'validate_js']);

gulp.task('default', ['validate', 'package']);
