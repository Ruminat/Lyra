//Libs
// window.$ = window.Jquery = require('./../lib/jquery.min.js');
window.$ = window.Jquery = require('./../lib/jquery-3.0.0.min.js');

//Electron modules
const remote        = require('electron').remote;
const app           = remote.app;
const shell         = remote.shell;
const BrowserWindow = remote.BrowserWindow;
//My modules
const Interface     = require('./../js/ui.js');