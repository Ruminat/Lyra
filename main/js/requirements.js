//Libs
window.$ = window.Jquery = require('./../lib/jquery.min.js');
//Electron modules
const remote        = require('electron').remote;
const app           = remote.app;
const shell         = remote.shell;
const BrowserWindow = remote.BrowserWindow;
//My modules
const Interface     = require('./../js/ui.js');