var gulp = require('gulp'),
	connect = require('gulp-connect'),
	sass = require('gulp-sass');

gulp.task('connect', function () {
	return connect.server({
		livereload: true
	});
});

gulp.task('sass', function () {
	return gulp.src('sass/*.scss')
		.pipe(sass().on('error', sass.logError))
	  .pipe(gulp.dest('./css'))
		.pipe(connect.reload());
});

gulp.task('sass:watch', function () {
	return gulp.watch('sass/*.scss', ['sass']);
});

gulp.task('default', ['sass:watch', 'connect']);
