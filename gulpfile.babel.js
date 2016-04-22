import gulp from 'gulp';
import requireDir from 'require-dir';
import sequence from 'run-sequence';

const tasks = requireDir('./tasks');

gulp.task('clean', tasks.clean());
gulp.task('sass', tasks.sass({
  src: ['!_*.scss', 'app/styles/atados.scss'],
  includePaths: [
    'node_modules/bootstrap-sass/assets/stylesheets'
  ]
}));
gulp.task('scripts', tasks.scripts({
  src: 'app/scripts/app.js'
}));

gulp.task('build', () => sequence('clean', ['sass', 'scripts']));

gulp.task('default', ['build']);
