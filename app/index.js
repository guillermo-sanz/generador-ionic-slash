'use strict';

var fs = require('fs');
var path = require('path');
var generators = require('yeoman-generator');
var _ = require('lodash');
var yosay = require('yosay');
var mout = require('mout');
var cordova = require('cordova');
var cordova = require('cordova-lib').cordova.raw; // get the promise version of all methods
var chalk = require('chalk');
var ionicUtils = require('../utils');
var appPath = path.join(process.cwd(), 'app');

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
    

    this.argument('appName', { type: String, required: false });
    this.option('appName', { type: String, required: false });
    this.option('appId', { type: String, required: false });
    this.option('compass', { type: Boolean, required: false });
    this.option('validate', { type: String, required: false });
    this.option('templates', { type: Array, required: false });
    this.option('plugins', { type: Object, required: false });
    this.option('platforms', { type: Array, required: false });
    this.options.selected = {};
  },

// ------------------------------INITIALIZING -------------------------------------------  
  initializing : function(){

    // get package.json content
    this.pkg = require('../package.json');

    this.log(ionicUtils.greeting); // bienvenida
    
    // non-empty dir?
    this.fileCount = fs.readdirSync('.').length;

    // abort when directory is not empty 
    if (this.fileCount > 0) {
      this.log(chalk.red('El directorio no está vacío. Se requiere un directorio vacío para crear el proyecto Cordova'));
      process.exit(1);
    }
  },

// ------------------------------PROMPTING -------------------------------------------
  prompting: {

    // ASK FOR SASS - COMPASS
    askForCompass: function askForCompass() {
      this.compass =true;
    /*var done = this.async();

      this.prompt([{
        type: 'confirm',
        name: 'compass',
        message: 'Quieres usar Sass con Compass (requiere Ruby)?',
        default: (typeof(this.options.compass) !== 'undefined') ? this.options.compass : false
      }], function (props) {
        this.compass = this.options.selected.compass = props.compass;

        done();
      }.bind(this));
    */

    },

    // ASK FOR NAME
    /*askFornameApp: function(){
      var done = this.async();

      this.prompt([{
        type: 'input',
        name: 'name',
        message: '¿Nombre de tu aplicación?',
        default: (typeof(this.options.compass) !== 'undefined') ? this.options.compass : false
      }], function (props) {
        this.compass = this.options.selected.compass = props.compass;

        done();
      }.bind(this));
    
    },*/

    

    // SELECT PLUGINS
    askForPlugins: function askForPlugins() {
      var done = this.async();

      if (this.options.plugins) {
        ionicUtils.mergePlugins(this.options.plugins);
      }

      this.prompt(ionicUtils.plugins.prompts, function (props) {
        this.plugins = this.options.selected.plugins = props.plugins;

        done();
      }.bind(this));
    },

    // ASK FOR SECTIONS
    askForSectionsApp : function(){
      var done = this.async();
      
      this.prompt([{
        type: 'input',
        name: 'sections',
        message: 'Escribe las partes que forman la aplicación separadas por una coma (,) : ',
        validate: ionicUtils.validates.validateSection
      }],function(props) {
        this.sections = this.options.selected.sections = props.sections;
         done();
         this.log(this.sections);
      }.bind(this));      
    },

    // ASK FOR HOME

    askForSectionHome: function (){
      var done = this.async();
      var sections=this.sections.split(',');
      this.prompt([{
        type: 'list',
        name: 'homeSection',
        message: 'Elige la home de tu aplicación: ',
        choices: sections
        
      }], function (props) {
        this.homeSection = this.options.selected.homeSection = props.homeSection;
        done();
      }.bind(this));
    
    },

    // SELECT START THEME 
    /*askForStarter: function askForStarter() {
      var done = this.async();

      if (this.options.templates) {
        ionicUtils.mergeStarterTemplates(this.options.templates);
      }

      var defaultIndex = 0;
      if (this.options.starter) {
        defaultIndex = _.findIndex(ionicUtils.starters.templates, { name: this.options.starter });

        if (defaultIndex === -1) {
          defaultIndex = 0;
          this.log(chalk.bgYellow(chalk.black('WARN')) +
            chalk.magenta(' Unable to locate the requested default template: ') +
            this.options.starter);
        }
      }


      this.prompt([{
        type: 'list',
        name: 'starter',
        message: 'Elige la plantilla para el proyecto:',
        choices: _.pluck(ionicUtils.starters.templates, 'name'),
       
      }], function (props) {
        this.starter = this.options.selected.starter = _.find(ionicUtils.starters.templates, { name: props.starter });
        done();
      }.bind(this));
    },
    */

    // SELECT PLATFORM
    askForPlatforms : function askForPlatforms(){
      var done = this.async();
     
      this.prompt([{
        type: 'checkbox',
        name: 'platforms',
        message: 'Selecciona las plataformas:',
        choices:[
            { 
              value: 'android',
              name: 'android',
              checked: true
            },
            {
              value: 'ios',
              name: 'ios',
              checked: false
             
            }
          ]
        }], function (props){
          this.platforms = this.options.selected.platforms = props.platforms;
          done();
        }.bind(this));
        }



  },



// ------------------------------CONFIGURING -------------------------------------------

  configuring: {
    commonVariables: function() {
      this.appName = this.appName || this.options.appName || path.basename(process.cwd());
      this.appName = mout.string.pascalCase(this.appName);
      this.appId = this.options.appId || 'com.example.' + this.appName;
      this.appPath = 'app';
      this.root = process.cwd();

      this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
    },

    setupEnv: function setupEnv() {
        // Removes thumbnail cache files
        var invisibleFiles = ['Thumbs.db', '.DS_Store'];
        invisibleFiles.forEach(function(filename) {
            var file = path.join(process.cwd(), filename)
            if(fs.existsSync(file) ) {
                fs.unlinkSync(file);
            }
       });
      // Copies the contents of the generator example app
      // directory into your users new application path
      this.sourceRoot(path.join(__dirname, '../templates/'));
      this.directory('common/root', '.', true);
    },

    packageFiles: function packageFiles() {
      this.template('common/_bower.json', 'bower.json');
      this.template('common/_bowerrc', '.bowerrc');
      this.template('common/_package.json', 'package.json');
      this.copy('common/_Gruntfile.js', 'Gruntfile.js');
      this.template('common/_gitignore', '.gitignore');
      
    }
  },


// ------------------------------ WRITING -------------------------------------------  

  writing: {
    // create Cordova project
    cordovaInit: function () {
      var done = this.async(); // wait with subsequent tasks since cordova needs an empty folder
      // cordova project
      cordova.create('.', this.appId, this.appName)
      // add platforms and save to config.xml
      .then(function () {
        this.log(chalk.green('Created cordova project'));
        if (!this.platforms.length) {
          return true;
        }
        else {
          return cordova.platform('add', this.platforms, { save: true });
        }
      }.bind(this))
      // add plugins and save to config.xml
      .then(function () {
        this.log(chalk.green('Added platforms: ' + this.platforms.join(', ')));
        if (!this.plugins.length) {
          return true;
        }
        else {
          return cordova.plugin('add', this.plugins, { save: true });
        }
      }.bind(this))
      // all
      .then(function () {
        this.log(chalk.green('Added plugins: ' + this.plugins.join(', ')));
        this.log(chalk.green('Cordova project was set up successfully! Project Name: '), chalk.bgGreen(this.appName));
        done();
      }.bind(this))
      .catch(function (err) {
        this.log(chalk.red('Couldn\'t finish generator: \n' + err));
        process.exit(1);
      }.bind(this));

       
    },


    installPlugins: function () {
      console.log(chalk.yellow('\nInstall plugins registered at plugins.cordova.io: ') + chalk.green('grunt plugin:add:org.apache.cordova.globalization'));
      console.log(chalk.yellow('Or install plugins direct from source: ') + chalk.green('grunt plugin:add:https://github.com/apache/cordova-plugin-console.git\n'));
      if (this.plugins.length > 0) {
        console.log(chalk.yellow('Installing selected Cordova plugins, please wait.'));
        
        // Turns out plugin() doesn't accept a callback so we try/catch instead
        try {
          cordova.plugin('add', this.plugins);
        } catch (e) {
          console.log(e);
          this.log.error(chalk.red('Please run `yo ionic` in an empty directory, or in that of an already existing cordova project.'));
          process.exit(1);
        }
      }
    },

    installStarter: function () {
      console.log(chalk.yellow('Installing starter template. Please wait'));
      var done = this.async();

      var callback = function (error, remote) {
        if (error) {
          done(error);
        }

        // Template remote initialization: Copy from remote root folder (.) to working directory (/app)
        remote.directory('.', 'app');
 
        this.starterCache = remote.cachePath;
        done();
      }.bind(this);

      // instalamos la plantilla Blank por defecto
       this.remote('driftyco', 'ionic-starter-blank', 'master', callback, true);

      // cuando esté el promp de escoger plantilla descomentada
      /*
      if (this.starter && this.starter.path) {
        this.log(chalk.bgYellow(chalk.black('WARN')) +
          chalk.magenta(' Getting the template from a local path.  This should only be used for developing new templates.'));
        this.remoteDir(this.starter.path, callback);
      } else if (this.starter.url) {
        this.remote(this.starter.url, callback, true);
      } else {
        this.remote(this.starter.user, this.starter.repo, 'master', callback, true);
      }
      */
    },

    readIndex: function () {
      this.indexFile = this.engine(this.read(path.join(this.starterCache, 'index.html')), this);
    },

    appJs: function appJs() {
     
      var scriptPrefix = 'js' + path.sep;

      var scripts = [scriptPrefix + 'configuration.js'];
      
      this.fs.store.each(function (file, index) {
        if (file.path.indexOf('.js') !== -1)
        {
          var relPath = path.relative(appPath, file.path);
          if (relPath.indexOf(scriptPrefix) === 0) {
            scripts.push(relPath);
          }
        }
      });

      //this.indexFile = this.appendScripts(this.indexFile, 'scripts/scripts.js', scripts);
    },

    createIndexHtml: function () {
             
        // Regex: Vendor CSS
        this.indexFile = this.indexFile.replace(/<link href="lib\/ionic\/css\/ionic.css" rel="stylesheet">/g, "<!-- build:css styles\/vendor.css -->\n    <!-- bower:css -->\n    <!-- endbower -->\n    <!-- endbuild -->");
        
        // Regex: User CSS
        this.indexFile = this.indexFile.replace(/<link href="css\/style.css" rel="stylesheet">/g, "<!-- start template tags -->\n    <!-- end template tags -->");
        
        // Regex: Vendor scripts (vendor.js)
        this.indexFile = this.indexFile.replace(/<script src="lib\/ionic\/js\/ionic.bundle.js"><\/script>/g, "<!-- build:js scripts\/vendor.js -->\n    <!-- bower:js -->\n    <!-- endbower -->\n    <!-- endbuild -->");
      
       // Regex: User scripts (scripts.js)
       this.indexFile = this.indexFile.replace(/<!-- your app's js -->/g,"<!-- your app's js -->\n <!-- your app's css -->\n   <!-- build:js scripts\/scripts.js -->");
       this.indexFile = this.indexFile.replace(/<\/head>/g,"  <script src=\"scripts\/configuration.js\"><\/script>\n    <!-- endbuild -->\n  <\/head>");
       
       // Regex/Rename: Scripts path (Ionics 'js' to 'scripts')
       this.indexFile = this.indexFile.replace(/href="css/g,"href=\"styles");
       
       // Regex/Rename: CSS path (Ionics 'css' to 'styles')
       this.indexFile = this.indexFile.replace(/src="js/g,"src=\"scripts");

       // change the name of ng-app attribute
       this.indexFile = this.indexFile.replace('starter',this.appName);

       // change body of index     
       this.indexFile = this.indexFile.replace('    <ion-pane>\n      <ion-header-bar class="bar-stable">\n        <h1 class="title">Ionic Blank Starter</h1>\n      </ion-header-bar>\n      <ion-content>\n      </ion-content>\n    </ion-pane>','    <ion-nav-view></ion-nav-view>'); 
       /*this.indexFile = this.indexFile.replace('<ion-pane>','<ion-nav-view></ion-nav-view>');      
       this.indexFile = this.indexFile.replace('<ion-header-bar class="bar-stable">','');
       this.indexFile = this.indexFile.replace('<h1 class="title">Ionic Blank Starter</h1>','');       
       this.indexFile = this.indexFile.replace('</ion-pane>','');
       this.indexFile = this.indexFile.replace('</ion-header-bar>','');
       this.indexFile = this.indexFile.replace('</ion-content>','');
       this.indexFile = this.indexFile.replace('</ion-content>',''); */
     
       // Write index.html
       this.indexFile = this.indexFile.replace(/&apos;/g, "'");
       this.write(path.join(this.appPath, 'index.html'), this.indexFile);
    },

    ensureStyles: function ensureStyles() {
      // Only create a main style file if the starter template didn't
      // have any styles. In the case it does, the starter should
      // supply both main.css and main.scss files, one of which
      // will be deleted
      
      var cssFile = 'main.' + (this.compass ? 'scss' : 'css');
      var unusedFile = 'main.' + (this.compass ? 'css' : 'scss');
      var stylePath = path.join(process.cwd(), 'app', 'css');
      var found = false;

      this.fs.store.each(function (file, index) {
        if (path.dirname(file.path) === stylePath) {
          var name = path.basename(file.path);

          if (name === cssFile) {
            found = true;
          } else if (name === unusedFile) {
            // BUG: The log will still report the the file was created
            this.fs.delete(file.path);
          }
        }
      }.bind(this));

      if (!found) {
        this.copy('styles/' + cssFile, 'app/css/' + cssFile);
      }

    },

    cordovaHooks: function cordovaHooks() {
      this.directory('hooks', 'hooks', true);
    },

  
    addFolders: function(){
      this.directory('translations', 'app/translations', true);
    },

    addSectionsFolders: function(){
        var arraySections = this.sections.split(",");
        var generator = this;
        arraySections.forEach(function(element, index, array){
          element=element.trim();
          function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
          }
          var elementCap=capitalizeFirstLetter(element);
          generator.template('fooFolder/fooJs.js','app/sections/' + element +'/' + element +'.js',{title :  generator.appName, section: elementCap+'Ctrl', url:element});
          generator.template('fooFolder/fooHtml.html','app/sections/' + element +'/' + element +'.html',{title: element});
          generator.template('fooFolder/fooCss.css','app/sections/' + element +'/' + element +'.css');

      });
    },

   packages: function () {
      this.installDependencies();
    }
  },



// ------------------------------END -------------------------------------------

  end: {

   addFolders: function(){
      fs.mkdir('app/services', function(){
        console.log('services folder created');
      });
      fs.mkdir('app/sections/shared', function(){
        console.log('shared folder created');
      });
      fs.mkdir('app/sections/shared/components', function(){
        console.log('components folder created');
      });
      fs.mkdir('app/fonts', function(){
        console.log('fonts folder created');
      });
    },

    hookPerms: function hookPerms() {
      var iconsAndSplash = 'hooks/after_prepare/icons_and_splashscreens.js';
      fs.chmodSync(iconsAndSplash, '755');
    },

    folderNames: function folderNames() {
      // Rename: Scripts path (Ionics 'js' to 'scripts')
      fs.rename(path.join(appPath, 'css'), path.join(appPath, 'styles'), function(err) {
          if ( err ) console.log('ERROR: ' + err);
      });
      
      // Rename: CSS path (Ionics 'css' to 'styles')
      fs.rename(path.join(appPath, 'js'), path.join(appPath, 'scripts'), function(err) {
          if ( err ) console.log('ERROR: ' + err);
      });
      
      // Rename: Images path (Ionics 'img' to 'images')
      fs.rename(path.join(appPath, 'img'), path.join(appPath, 'images'), function(err) {
          if ( err ) console.log('ERROR: ' + err);
      });
     
    },

    deleteCreateAppJs: function(){
      var arraySections=this.sections.trim().split(',');
      var arrayModules=[];
      var generator = this;
       // Delete app.js 
      fs.unlink(appPath + '/scripts/app.js',function(){
        console.log(appPath + '/scripts/app.js borrado');
      });
      
      // create new array of sections modules with the prefix app name 
      arraySections.forEach(function(element, index, array){
         arrayModules.push('\'' + generator.appName + '.' + element + '\'');
      });
    
      // and create other with our parameters 
      this.template('app.js', appPath+'/scripts/app.js',{title:this.appName, modules: arrayModules, homeSection : this.homeSection});
      console.log(appPath + '/scripts/app.js creado de nuevo');
      // create template menu
      this.template('menu.html', 'app/sections/menu.html', {sections: arraySections});
      
     
    },
    runGruntTasks: function(){
      this.spawnCommand('grunt', ['build']);

    }
    
  }
});

