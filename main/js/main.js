//Node modules
 var request = require('request');
 var path    = require('path');
 var fs      = require('fs');
 var globalShortcut = remote.require('global-shortcut');

//Main object
var data = {
	connection: navigator.onLine,
	focus: true,
	playlists: {
		num: -1,
		list: []
	},
	settings: {},
	mouse: {
		move: function(){},
		up:   function(){}
	}
};

//My modules
 var pcMusic   = require('./../js/main/localMusic.js');
 var Playlists = require('./../js/main/playlists.js');
 var mainUI    = require('./../js/main/main-ui.js');
 var player    = require('./../js/main/player.js');
 var audio     = require('./../js/main/audio.js');
 var vk        = require('./../js/main/vk.js');
 
 var range     = require('./../js/range.js');
 var scroll    = require('./../js/scroll.js');
 var storage   = require('./../js/dataStorage.js');

$(document).ready(function() {

	storage = new storage();
	audio   = new audio(data);
	player  = new player(audio);
	vk      = new vk(data, player);

	//Interface initialization
	var win = remote.getCurrentWindow();
	var ui  = new interface(win, data);
	mainUI  = new mainUI(win, vk);

	//Parse vk data from URL
	var parse = vk.parseLogin(win)
	if (parse) {
		data.vk = parse;
		vk.getAudio();
	}

	player.songsScroll();
	
	//Some crap
	player.changeVolume(0.5);
});