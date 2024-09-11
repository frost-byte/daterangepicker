import gulp from 'gulp';
const {src, series, task} = gulp;
import fs from 'fs';
import gulpLoadPlugins from 'gulp-load-plugins';
import childProcess from 'child_process';
import githubRelease from 'gulp-github-release';
import ghPages from 'gulp-gh-pages';

const $ = gulpLoadPlugins();
const exec = childProcess.exec;
require('./website.babel.mjs');

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

export const buildWebsite = task('build:website', () => {
  return src('./dist/website/**/*')
    .pipe(ghPages())
});

function _buildMin(cb) {
  exec('git status', function callback(error, stdout, stderr) {
    const pendingChanges = stdout.match(/modified:\s*dist/)
    if (pendingChanges) {
      throw new Error('consistency check failed');
    } else {
      cb();
    }
  });
}

export const buildMin = task('build:min', _buildMin);
task('github:pages', series('build:website'));
task('consistency-check', series('build:min'));

task(
  'github:release',
  series('consistency-check', () => {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('env.GITHUB_TOKEN is empty');
    }

    var manifest = readJson('./package.json');
    const match = manifest.repository.url.split('/').slice(-2)

    return src([
      'dist/daterangepicker.js',
      'dist/daterangepicker.css',
      'dist/daterangepicker.min.js',
      'dist/daterangepicker.min.css'
    ])
    .pipe(githubRelease({
      manifest: manifest,
      owner: match[0],
      repo: match[1]
    }));
  })
);
