import gulp from 'gulp';
const {src, dest, series, task} = gulp;
import gulpBump from 'gulp-bump';
import * as build from './build.babel.mjs';


export function bump(type) {
  return src('./package.json')
    .pipe(gulpBump({type: type}))
    .pipe(dest('./'));
}

task(
  'bump:major',
  series([
    () => {
      return src('./package.json')
      .pipe(gulpBump({type: 'major'}))
      .pipe(dest('./'))
    },
    'build:min']
  )
);

task(
  'bump:minor',
  series([
    () => {
      return src('./package.json')
      .pipe(gulpBump({type: 'minor'}))
      .pipe(dest('./'))
    },
    'build:min']
  )
);

task(
  'bump:patch',
  series([
    () => {
      return src('./package.json')
      .pipe(gulpBump({type: 'patch'}))
      .pipe(dest('./'))
    },
    'build:min']
  )
);
