const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');

// Compilar SASS
gulp.task('sass', function() {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/css'));
});

// Concatenar e minificar JS
gulp.task('scripts', function() {
    return gulp.src([
            'src/js/modal.js',
            'src/js/app.js'
        ])
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

// Watch para desenvolvimento
gulp.task('watch', function() {
    gulp.watch('src/scss/**/*.scss', gulp.series('sass'));
    gulp.watch('src/js/**/*.js', gulp.series('scripts'));
});

// Tarefa padrão
gulp.task('default', gulp.series('sass', 'scripts', 'watch'));