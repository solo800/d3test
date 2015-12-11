var gulp = require('gulp'),
	connect = require('gulp-connect'),
	sass = require('gulp-sass'),
	ts = require('gulp-typescript');

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

gulp.task('ts', function () {
	return gulp.src('scripts/ts/*.ts')
		.pipe(ts({ target: 'ES5' }))
		.pipe(gulp.dest('./scripts/js'));
});

gulp.task('ts:watch', function() {
	return gulp.watch('scripts/ts/*.ts', ['ts']);
});

gulp.task('default', ['sass:watch', 'ts:watch', 'connect']);
