# MHBO - Static

A temporary repo to turn MHBO's mockups into HTML and CSS

##Application

### Requirements
To work on the front-end code of the application, you'll need to have the following items installed before continuing.

* [Node.js](http://nodejs.org): Use the installer provided on the NodeJS website.
* [Gulp](http://gulpjs.com/): Run `[sudo] npm install -g gulp`
* **[Bower](http://bower.io): Run `[sudo] npm install -g bower`
* [Ruby](https://www.ruby-lang.org/en/installation/): Should come pre-installed on Macs


** Only necessary if user wants to add third-party libraries/frameworks to project

### Structure

```
root
├── Pages       // Holds various html files, representing each mockup, ie Home, About, Contact Us, etc
├── Resources   // Holds all front-end assets required for the html in Pages, including css, js and templates
└── Tasks       // Holds project tasks, including sass compiling and spinning up a local server

```

## Tasks 

### Structure

```
root
│
└── Tasks
    ├── Gulpfile.js 
    │       // Project tasks are defined here
    │       // Loads config/index.js
    │
    ├── config
    │   ├── index.js   // Allow for `config` directory to be used as a Node module, loading `paths` and `options`
    │   ├── options.js // Predefined options Objects for Gulp tasks
    │   └── paths.js   // Predefined Arrays of Resource file paths for Gulp tasks
    │
    ├── bower.json    // Project's third-party libraries (JS, CSS, SCSS)
    ├── package.json  // Node dependencies for this directory
    └── node_modules  // Stores node libraries declared in package.json
```
### Usage
    
* `gulp build`
    * Compiles, builds and live-reloads Sass
    * Lints and builds Javascript
    * Destination of build files is defined in `paths.js`
    
* `gulp` or `gulp dev`
    * Run a local dev server located at http://localhost:8888/<file-name>.html using "built" files, along with sourcemaps.
    * Watches all \*.scss and \*.js files, automatically building those resources when a change is detected
    

## Development

### Getting Started

It is imperative to have the default `gulp` (or `gulp dev`) task running while developing.

### Structure
```
root
│
└── Resources
    ├── bower_components // Contains all third-party libraries and frameworks
    ├── js        
    │   ├── app.js   // Instantiates application
    │   └── modules  // Exposes "modules" to global namespace, to be executed in app.js
    │
    ├── jade  //  Contains Jade templates
    ├── build      // Contains `build` files of JS and CSS and contains SCSS sourcemap
    ├── images     // Nothing special   
    └── scss
        ├── app.scss    // The only scss file that is compiled. Contains `@import`s of the rest of the scss 
        ├── config      // Contains scss variables and overrides of bootstrap scss variables
        ├── general     // Unspecific scss declarations, i.e. `sm-text-small` and `md-text-large`
        └── components  // Styling specific to certain templates
```


### Adding New Javascript Files

Rather than declaring new files in the html, new files are declared within `[root]/Tasks/config/paths.js`...

* Declare new js bower files in `path.js.lib`.
* Declare custom js files in `path.js.src`.
* The files will be concatenated in the order that they are listed.

### Adding New SCSS Files

* Include new stylesheets in `/Resources/scss/app.scss` using `@import "path/to/file.scss"`

