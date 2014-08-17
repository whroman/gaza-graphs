// ========
// #Options

var path = require('./paths.js');
var options = {

    gulpSrc: {
        cwd     : path.cwd,
    },

    gulpNoRead: {
        cwd     : path.cwd,
        read    : false
    },

    scss: {
        sourcemapPath: path.cwd + path.scss.src,
        style: 'compressed'
    },

    css: {
        keepSpecialComments : 0,
        removeEmpty : true,
    },

    uglify: {
        outSourceMap: true,
        basePath: path.cwd + path.build,
        mangle  : false,
    },

    connect: {
        root    : [path.cwd],
        port    : '8889',
        livereload: false
    }
}

module.exports = options;