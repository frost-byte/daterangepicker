import gulp from 'gulp';
const {src, dest, series, task} = gulp;

import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import fs from 'fs';
import browserSync from 'browser-sync';
import log from 'fancy-log';
import plumber from 'gulp-plumber';
import gulpIf from 'gulp-if'; 
import gulpInclude from 'gulp-include';
import gulpSize from 'gulp-size';
import coffee from 'gulp-coffee';
import extReplace from 'gulp-ext-replace';
import header from 'gulp-header';
import cleanCss from 'gulp-clean-css';
import babelMinify from 'gulp-babel-minify';
import autoPrefixer from 'gulp-autoprefixer';

const reload = browserSync.reload;
const sass = gulpSass(dartSass);

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

export function banner() {
  var pkg = readJson('./package.json');
  var bower = readJson('./bower.json');
  return `
    /*!
     * ${bower.name}
     * version: ${pkg.version}
     * authors: ${bower.authors}
     * license: ${bower.license}
     * ${bower.homepage}
     */
  `.replace(/\n\s{0,4}/g, '\n').replace('\n', '');
}

function _styles() {
  return (
    src([
      'src/styles/*.scss',
      'website/styles/*.scss'
    ])
    .pipe(plumber())
    .pipe(sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', log))
    .pipe(autoPrefixer())
    .pipe(dest('.tmp/styles'))
    .pipe(reload({stream: true}))
  );
}

export const styles = task('styles', _styles);

export const scripts = task('scripts', () => {
  return (
    src([
      'src/scripts/*.coffee',
      'website/scripts/*.coffee'
    ])
    .pipe(gulpInclude()).on('error', log)
    .pipe(plumber())
    .pipe(coffee().on('error', log))
    .pipe(dest('.tmp/scripts'))
    .pipe(reload({stream: true}))
  )
});

function _build() {
  return src(['.tmp/scripts/daterangepicker.js', '.tmp/styles/daterangepicker.css'])
    .pipe(header(banner()))
    .pipe(dest('dist/'))
    .pipe(gulpSize({title: 'build', gzip: true}))
}

export const build = task('build', series('scripts', 'styles', _build));

function _buildMin() {
  return src(['dist/daterangepicker.js', 'dist/daterangepicker.css'])
    .pipe(gulpIf('*.js', babelMinify()))
    .pipe(gulpIf('*.css', cleanCss({compatibility: '*'})))
    .pipe(gulpIf('*.js', extReplace('.min.js')))
    .pipe(gulpIf('*.css', extReplace('.min.css')))
    .pipe(dest('dist/'))
    .pipe(gulpSize({title: 'build:min', gzip: true}));
}

export const buildMin = task(
  'build:min',
  series('build', _buildMin)
);
