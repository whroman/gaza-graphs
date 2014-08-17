var path    = {
    cwd     : '../',
    resources : 'Resources/',
    root    : {},
    js      : {},
    css     : {},
    scss    : {},
}

path.build  = path.resources + 'build/'
path.bower  = path.resources + 'bower_components/'

// Root of respective resource types
path.root = {
    js : path.resources + 'js/',
    scss : path.resources + 'scss/',
}

// =====
// #scss
// =====
path.scss = {
    watch   : path.root.scss + '**/*.scss',
    src     : path.root.scss + 'app.scss',
};

// =====
// #css
// =====
path.css = {
    build : path.build  + 'build.css'
};

// ==========
// #js
// ==========

path.js = {
// Build files
    build    : 'build.js',

// Files to be watched and linted
    watch    : path.root.js + '**/*.js',
}

path.js.libs = [
    path.bower + 'jquery/dist/jquery.js',
    path.bower + 'd3/d3.js'
];

path.js.src = [
    path.root.js + 'app.js'
];

path.js.all = path.js.libs.concat(path.js.src);

module.exports = path;