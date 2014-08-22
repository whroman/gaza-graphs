var gulp = require('gulp');
var JSHintStylish = require('jshint-stylish');

// Loads all gulp plugins located in package.json
// > Call plugins using `gp.<camelizedPluginName>
var gp = require('gulp-load-plugins')();

// Load configurations for gulp files
var config = require('./config');
var path = config.path;
var options = config.options;

// ======
// #Tasks

gulp.task(
    'build-styles',
    function() {
        gulp.src(path.scss.src, options.gulpSrc)
    // Rename scss file
        .pipe(gp.rename("build.scss"))
    // Compile scss
        .pipe(gp.rubySass(options.scss))
        .on('error', gp.util.log)
    // Dump css build file
        .pipe(gulp.dest("../Resources/build"))
    }
);

gulp.task(
    'lint-scripts',
    function() {
        gulp.src(path.js.watch, options.gulpSrc)
    // Lints JS
        .pipe(gp.jshint().on('error', gp.util.log))
    // Make output PRETTY!
        .pipe(gp.jshint.reporter(JSHintStylish))
    }
);

gulp.task(
    'build-scripts',
    function() {
        gulp.src(path.js.all, options.gulpSrc)
    // Concat and Uglify concat'd JS file
        .pipe(gp.uglifyjs(path.js.build, options.uglify).on('error', gp.util.log))
    // Dump JS build file
        .pipe(gulp.dest(path.cwd + path.build))
    }
);

gulp.task(
    'connect', 
    gp.connect.server(options.connect)
);

gulp.task(
    'watch', 
    function() {
        gulp.watch(
            path.scss.watch, 
            options.gulpNoRead,
            [
                'build-styles'
            ]
        )

        gulp.watch(
            path.js.watch, 
            options.gulpNoRead,
            [
                'lint-scripts',
                'build-scripts'
            ]
        )  
    }
);

gulp.task(
    'build', [
        'lint-scripts',
        'build-scripts',
        'build-styles'
    ]
)

gulp.task(
    'default', [
        'build',
        'watch',
        'connect'
    ]
); 

gulp.task(
    'dev', 
    ['default']
); 