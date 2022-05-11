import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import jsmin from 'gulp-jsmin';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-libsquoosh';
import svgstore from 'gulp-svgstore';
import del from 'del';

// Styles
export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML
const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

// Scripts
const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(jsmin())
    .pipe(gulp.dest('build/js'));
}


// Images
const optimizeImages = () => {
  return gulp.src(['source/img/**/*.{jpg,png}', '!source/img/favicons/*.{jpg,png}'])
    .pipe(squoosh())
    .pipe(gulp.dest('build/img', {}));
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(gulp.dest('build/img', {}));
}

// SVG
const svg = () => {
  return gulp.src(['source/img/**/*.svg', '!source/img/icons/*.svg', '!source/img/favicons/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img', {}));
}

const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img', {}));
}

// Copy
const copy = (done) => {
  return gulp.src([
    'source/fonts/*.{woff,woff2}',
    'source/img/favicons/*.{png,svg}'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

// Create Webp
const createWebp = () => {
  return gulp.src(['source/img/**/*.{jpg,png}', '!source/img/favicons'])
    .pipe(squoosh({
      webp: {}
    }))
    .pipe(gulp.dest('build/img', {}));
}

// Server
const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload
const reload = (done) => {
  browser.reload();
  done();
}

// Watcher
const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
}

// Clean
const clean = () => {
  return del('build');
}

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    html,
    styles,
    scripts,
    svg,
    sprite,
    createWebp,
  )
);

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    html,
    styles,
    scripts,
    svg,
    sprite,
    createWebp,
  ),
  gulp.series(
    server,
    watcher
  )
);
