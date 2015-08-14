var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var reactify = require('reactify');

gulp.task('reactor', function() {
    var b = browserify({standalone: 'chatblast'});
    b.transform(reactify);
    b.add('./src/main.jsx');
    return b.bundle()
        .pipe(source('./dist/bundle.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('watch', function(){
    gulp.watch('./src/**/*.{js,jsx}', ['reactor']);
});

gulp.task('default', ['watch']);