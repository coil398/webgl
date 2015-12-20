gulp = require 'gulp'
coffee = require 'gulp-coffee'
uglify = require 'gulp-uglify'
concat = require 'gulp-concat'
plumber = require 'gulp-plumber'

gulp.task 'compile-coffee', () ->
    gulp.src './coffee/*.coffee'
    .pipe plumber()
    .pipe coffee()
    .pipe gulp.dest('./scripts')

gulp.task 'compile-js',['compile-coffee'], () ->
    gulp.src ['./scripts/*.js']
    .pipe plumber()
    .pipe concat('application.js')
    ##.pipe uglify('application.min.js')
    .pipe gulp.dest('./js')


gulp.task 'watch' , () ->
    gulp.watch './coffee/*.coffee',['compile-js']
