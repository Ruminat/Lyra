//Libs
window.$ = window.Jquery = require('./../lib/jquery.min.js');
//Electron modules
var remote = require('electron').remote;
var app = remote.app;
var BrowserWindow = remote.BrowserWindow;
//My modules
var interface = require('./../js/ui.js');