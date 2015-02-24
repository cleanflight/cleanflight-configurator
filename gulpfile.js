var gulp = require('gulp');
var del = require('del');
var babel = require('gulp-babel');

gulp.task('clean', function(cb) {
  del('./dist', cb);
});

gulp.task('move',['clean'], function(){
  gulp.src(['./app/**/*.*', '!./app/**/*.js'], { base: './app' })
    .pipe(gulp.dest('dist'));
  gulp.src('./app/js/libraries/**/*.js', { base: './app' })
    .pipe(gulp.dest('dist'));

  return gulp.src(['./app/**/*.js', '!./app/js/libraries/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['move'], function() {
});
