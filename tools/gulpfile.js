var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var pngquant = require('pngquant');
//var smushit = require('gulp-smushit');

gulp.task('default', function () {
    return gulp.src('../src/assets/aboutUS/**/*.{png,gif,jpg}')
        /*.pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.svgo({plugins: [{removeViewBox: true}]}),
            pngquant({quality: '65-80', speed : 1})
        ]))
        */
        /*
        .pipe(smushit({
            verbose: true
        }))
        */
        .pipe(gulp.dest('../dist/assets/aboutUs/'));
});