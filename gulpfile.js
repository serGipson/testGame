var gulp = require('gulp');
var webserver = require('gulp-webserver');
 
gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(webserver({
      livereload: true,
      directoryListing: true,
      open: "http://localhost:8000/index.html"
    }));
});

gulp.task('default', function() {
	gulp.run('webserver');
});