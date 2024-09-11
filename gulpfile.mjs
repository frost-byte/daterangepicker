import { series, src, task } from 'gulp';
import del from 'del';
import babel from '@babel/register';
import mochaPhantomjs from 'gulp-mocha-phantomjs'
import * as build from './tasks/build.babel.mjs';
import * as bump from './tasks/bump.babel.mjs';
import * as website from './tasks/website.babel.mjs';
babel({
  extensions: ['.js','.jsx','.mjs']
})

task('clean', () => {
  return del(['.tmp', '.publish', 'dist'])
});

task(
  'travis-ci',
  series('build:website', function () {
    src('dist/website/tests.html')
    .pipe(mochaPhantomjs());
  })
);

task('default', series('clean', 'build'));
