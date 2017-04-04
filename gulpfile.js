const gulp = require('gulp'),
  mocha = require('gulp-mocha'),
  releaseHelper = require('release-helper'),
  ts = require('gulp-typescript'),
  tsProject = ts.createProject('tsconfig.json'),
  fsExtra = require('fs-extra'),
  runSequence = require('run-sequence'),
  path = require('path'),
  webpack = require('webpack'),
  exec = require('child_process').exec;



//Init custom release tasks
releaseHelper.init(gulp);

let glue = suffix => gulp.src(`src/**/*.${suffix}`).pipe(gulp.dest('lib'));

let watch = (suffix, tasks) => {
  tasks = tasks ? tasks : [suffix];
  return gulp.watch(`src/**/*.${suffix}`, tasks);
}

gulp.task('pug', () => glue('pug'));

gulp.task('ts', () => {
  let tsResult = tsProject.src()
    .pipe(tsProject());
  return tsResult.js.pipe(gulp.dest('lib'));
});

gulp.task('watch-ts', () => watch('ts'));
gulp.task('watch-pug', () => watch('pug'));

gulp.task('unit', ['build'], () => {
  return gulp.src('test/unit/**/*.js', { read: false })
    .pipe(mocha({ require: ['babel-register'] }));
});

gulp.task('it', ['build'], () => {
  return gulp.src('test/it/**/*-test.js', { read: false })
    .pipe(mocha({ require: ['babel-register'] }));
});

gulp.task('clean', (done) => {
  fsExtra.remove('lib', done);
});

gulp.task('default', ['build']);

gulp.task('build-root', done => {
  let cfg = require('./src/root/webpack.config');
  cfg.output.path = path.resolve('./lib/root/public');
  webpack(cfg, done);
});

gulp.task('build-player', done => {
  let cfg = require('./src/player/webpack.config');
  cfg.output.path = path.resolve('./lib/player/public');
  webpack(cfg, done);
});

gulp.task('build-clients', done => runSequence('build-root', 'build-player', done));

gulp.task('build', done => runSequence('clean', ['pug', 'ts', 'build-clients'], done));

gulp.task('dev', ['build', 'watch-pug', 'watch-ts']);

gulp.task('test', ['unit']);

