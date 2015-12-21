gulp = require 'gulp'
coffee = require 'gulp-coffee'
plumber = require 'gulp-plumber'

gulp.task 'compile-coffee', () ->
    gulp.src './coffee/*.coffee'
    .pipe plumber()
    .pipe coffee()
    .pipe gulp.dest('./scripts')

gulp.task 'watch' , () ->
    gulp.watch './coffee/*.coffee',['compile-coffee']
