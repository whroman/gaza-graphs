# [D3.js Partition Graphs of the 2014 Israeli-Gaza Conflict](http://whroman.github.io/gaza-graphs/)

![Image of Palestinian Casualties](https://raw.githubusercontent.com/whroman/gaza-graphs/gh-pages/gaza-graphs.png)

Technologies used:
	
* [Sass](http://sass-lang.com/) - To make writing CSS not suck
* [Gulp](http://gulpjs.com/) - To automate tasks
* [Bower](http://bower.io) - To manage third-party libraries
* [D3.js](http://d3js.org/) - To handle Javascript graphing
* [JS-Lint](http://www.jslint.com/) - To ensure best practices in project's JS
	
##Application

### Requirements
To work on the front-end code of the application, you'll need to have the following packages installed before continuing.

* [Node.js](http://nodejs.org): Use the installer provided on the NodeJS website.
* [Gulp](http://gulpjs.com/): Run `[sudo] npm install -g gulp`
* [Bower](http://bower.io) **: Run `[sudo] npm install -g bower`
* [Ruby](https://www.ruby-lang.org/en/installation/): Comes installed on Macs.
* [Sass](http://sass-lang.com/install) *: Run `[sudo] gem install sass`. Version 3.3 or higher is required due to sourcemap support


\** Only necessary if user wants to add third-party libraries/frameworks to project

### Structure

```
root
├── Resources   // Holds all front-end assets, including css, js and templates
|
└── Tasks       // Holds project tasks, including sass and js compiling, js-linting and spinning up a local server

```

## Tasks 

### Structure

```
root
└── Tasks
    ├── Gulpfile.js 
    │       // Project tasks are defined here
    │       // Loads `config` module
    │
    └── config
        ├── index.js   // Allows for `config` directory to be used as a Node module, loading `paths.js` and `options.js`
        ├── options.js // Exposes object containing predefined options for use with Gulp plugins
        └── paths.js   // Exposes object containing file paths of Resources manipulated by Gulp tasks

```
### Usage
    
* `gulp build`
    * Compiles Sass into minified CSS
    * Concatenates and minifies JS
    * Runs JS-Lint on Javascript
    * Destination of build files is defined in `Tasks/config/paths.js`
    
* `gulp` or `gulp dev`
    * Run a local server located at http://localhost:8889 with unminified files or http://localhost:8889 using production-ready files. This allows for development involving HTTP and AJAX requests.
    * Watches all Resources/scss/\*\*/\*.scss and Resources/js/\*\*/\*.js files, automatically compiling and building the resources when a change is detected.
    

## Development

### Getting Started

It is imperative to have the default `gulp` (or `gulp dev`) task running while developing. The dev server is located at `http://localhost:8889`.

### Structure
```
root
└── Resources
    ├── bower_components // Contains all third-party libraries
    ├── js         // Nothing special
    ├── build      // Contains `built` versions of SCSS and JS files, along with sourcemaps
    └── scss
        └── app.scss    // Only scss file that is compiled. Contains `@import`s for the rest of the scss 
```

### Adding New JS Libraries

1. Add lib to project using `bower` in the `Tasks` directory.
2. The lib will appear in `[root]/Resources/bower_components/....`
3. Declare the path to the lib file in `[root]/Tasks/config/paths.js` as an Array item in `path.js.libs`. The files will be concat'd in listed order.


### Adding New JS Files

* Declare the path to the new file in `[root]/Tasks/config/paths.js` as an Array item in `path.js.src`. The files will be concat'd in listed order.
    

### Adding New SCSS Files

* Include new stylesheets in `/Resources/scss/app.scss` using `@import "path/to/file.scss"`