var chalk = require('chalk');
this.pkg = require('../package.json');

module.exports = chalk.black(
     '   _____ _                _____ _    _ '+
     '\n  / ____| |        /\\    / ____| |  | |'+
     '\n | (___ | |       /  \\  | (___ | |__| |'+
     '\n  \\___ \\| |      / /\\ \\  \\___ \\|  __  |'+
     '\n  ____) | |____ / ____ \\ ____) | |  | |'+
     '\n |_____/|______/_/    \\_\\_____/|_|  |_|'+
     '\n \n' + chalk.blue('Bienvenido al generador de Ionic de Slash versión '+ chalk.red(this.pkg.version) + '\n'));

