// 'use strict';

const gulp  = require('gulp');
const ejs   = require('gulp-ejs');
const gutil = require('gulp-util');

gulp.task('ejs', () => {
	return gulp.src('main/views/*.ejs')
		.pipe(ejs({}, {ext: '.html'}).on('error', () => {
			gutil.beep();
			return false;
		}))
		.pipe(gulp.dest('main/views/'));
});

gulp.task('watch', () => {
	gulp.watch('main/views/**/*.ejs', ['ejs']);
})

gulp.task('git', () => {
	return gulp.src(['./**/*.*', '!node_modules/**/*.*', '!git/**/*.*'])
		.pipe(gulp.dest('git'));
});

gulp.task('default', ['ejs', 'watch']);