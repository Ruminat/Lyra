//Node modules
 var globalShortcut = remote.globalShortcut;
 var request        = require('request');
 var path           = require('path');
 var fs             = require('fs');

//My modules
 var SongsEvents = require('./../js/main/modules/songs-events.js');
 var Settings    = require('./../js/main/modules/settings.js');
 var Groups      = require('./../js/main/modules/groups.js');
 var PcMusic     = require('./../js/main/localMusic.js');
 var Playlists   = require('./../js/main/playlists.js');
 var MainUI      = require('./../js/main/main-ui.js');
 var Player      = require('./../js/main/player.js');
 var Audio       = require('./../js/main/audio.js');
 var Vk          = require('./../js/main/vk.js');
 
 var Range       = require('./../js/range.js');
 var Scroll      = require('./../js/scroll.js');
 var Checkers    = require('./../js/checkers.js');
 var Storage     = require('./../js/dataStorage.js');

 //Main object
var data = {
	connection: navigator.onLine,
	check: true,
	focus: true,
	state: 'none',
	playlists: {
		num: -1,
		list: [],
		state: 'idle'
	},
	settings: {
		saved: {
			volume: 1
		},
		download: {}
	},
	mouse: {
		move: function(){},
		up:   function(){}
	}
};

$(document).ready(function() {

	window.storage   = new Storage();
	window.audio     = new Audio(data);
	window.player    = new Player(audio);
	window.playlists = new Playlists(data);
	window.vk        = new Vk(data, player);
	//Interface initialization
	window.win       = remote.getCurrentWindow();
	window.ui        = new Interface(win, data);
	window.mainUI    = new MainUI(win, vk);

	//Parse vk data from URL
	var parse = vk.parseLogin(win)
	if (parse) {
		data.vk = parse;
		vk.getAudio();
		vk.online();
		data.state = 'vk';
	}

	playlists.initialize();
	
	//Volume change (gotta rid of it in production)
	player.changeVolume(0.5);
});