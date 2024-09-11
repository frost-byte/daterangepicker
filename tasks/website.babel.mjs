import gulp from 'gulp';
const { src, dest, series, task, watch } = gulp;
import marked from 'marked';
import highlight from 'highlight.js';
import browserSync from 'browser-sync';
import log from 'fancy-log';
import gulpIf from 'gulp-if'; 
import gulpSize from 'gulp-size';
import useref from 'gulp-useref';
import minifyCss from 'gulp-minify-css';
import uglify from 'gulp-uglify';
import fileInclude from 'gulp-file-include';
import fs from 'fs';

const reload = browserSync.reload;

const certPath = '/etc/nginx/acme.sh/dev.wiserowl.com/fullchain.pem';
const keyPath = '/etc/nginx/acme.sh/dev.wiserowl.com/key.pem';

const httpsConfig = fs.existsSync(certPath) && fs.existsSync(keyPath) ? {
  key: keyPath,
  cert: certPath
} : false;

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false,
  highlight: (code, lang) => {
    return highlight.highlightAuto(code, [lang]).value;
  }
});

function markdownFilter(code) {
  code = code
    .replace(/[\s\S]*(?=#+ Notable Features)/m, '')
    .replace(/#+ Copyright[\s\S]*/m, '');
  return marked(code);
}

task('images', () => {
  return src('website/images/*')
    .pipe(dest('dist/website/images'))
});

task(
  'html',
  series('styles', 'scripts', () => {
    return src('website/*.html')
      .pipe(fileInclude({
        prefix: '@@',
        basepath: '@file',
        filters: {
          markdown: markdownFilter
        }
      })).on('error', log)
      .pipe(dest('.tmp'))
      .pipe(reload({stream: true}));
  })
);

task(
  'serve',
  series('html', 'styles', 'scripts', () => {
    browserSync({
      notify: false,
      port: 8081,
      ghostMode: {
        clicks: false,
        forms: false,
        scroll: false
      },
      https: httpsConfig,
      server: {
        baseDir: ['.tmp', 'website'],
        routes: {
          '/bower_components': 'node_modules',
          '/docs': '.tmp/docs.html',
          '/tests': '.tmp/tests.html',
          '/examples': '.tmp/examples.html'
        }
      }
    });

    watch([
      '{src,website}/scripts/**/*.coffee',
      'test/**/*.coffee',
      'src/templates/**/*.html',
      'website/**/*.html',
      '{docs,.}/*.md'
    ]).on('change', reload);

    watch('{src,website}/styles/**/*.scss', series(['styles']));
    watch('test/**/*.coffee', series(['scripts']));
    watch('{src,website}/scripts/**/*.coffee', series(['scripts']));
    watch('src/templates/**/*.html', series(['scripts']));
    watch('website/**/*.html', series(['html']));
    watch('{docs,.}/*.md', series(['html']));
  })
);

task(
  'build:website',
  series('html', 'scripts', 'styles', 'images',
  () => {
    const assets = useref({searchPath: ['.tmp', 'website', '.']});

    return src('.tmp/*.html')
      .pipe(assets)
      .pipe(gulpIf('*.js', uglify({ output: {comments: 'some'} })))
      .pipe(gulpIf('*.css', minifyCss({compatibility: '*'})))
      .pipe(useref())
      .pipe(dest('dist/website'))
      .pipe(gulpSize({title: 'build:website', gzip: true}));
  })
);

task(
  'serve:website',
  series('build:website', () => {
    browserSync({
      notify: false,
      port: 9000,
      server: {
        baseDir: ['dist/website']
      }
    });
  })
);
