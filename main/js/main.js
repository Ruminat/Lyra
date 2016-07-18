//Node and Electron modules
	const globalShortcut = remote.globalShortcut;
	const dialog         = remote.dialog;
	const path           = require('path');
	const fs             = require('fs');
	const http           = require('http');
	const URL            = require('url');
	
//My modules
	const DefaultSettings = require('./../js/main/modules/defaultSettings.js');
	const EndlessScroll   = require('./../js/main/modules/endlessScroll.js');
	const SongsEvents     = require('./../js/main/modules/songs-events.js');
	const Settings        = require('./../js/main/modules/settings.js');
	/* Module for communities (or groups) in VK */
	const Groups          = require('./../js/main/modules/groups.js');
	/* Module for local music on current PC */
	const PcMusic         = require('./../js/main/localMusic.js');
	const Playlists       = require('./../js/main/playlists.js');
	const MainUI          = require('./../js/main/main-ui.js');
	const Player          = require('./../js/main/player.js');
	const Audio           = require('./../js/main/audio.js');
	const Vk              = require('./../js/main/vk.js');
	
	/* Module for ranges (like song's progress, volume range e.t.c.) */
	const Range           = require('./../js/range.js');
	const Scroll          = require('./../js/scroll.js');
	const Checkers        = require('./../js/checkers.js');
	const Storage         = require('./../js/dataStorage.js');

 //Main object
window.data = {
	connection: navigator.onLine,
	check: true,
	focus: true,
	state: 'none',
	downloads: [],
	shit: {},
	sync: {
		storage: false,
		player:  false,
		playlists: false,
		settings: false
	},
	playlists: {
		num:   -1,
		list:  [],
		state: 'idle'
	},
	mouse: {
		move: function() {},
		up:   function() {}
	}
};
//'s' means settings
window.s = DefaultSettings();
//saved parameters (like volume, shuffle, repeat e.t.c.)
window.saved = {};
//Synchronize between dataStorage and other modules
window.synchronize = (what) => {
	data.sync[what] = true;
	if (data.sync.storage) {
		check(player,    'player');
		check(settings,  'settings');
		check(playlists, 'playlists');
	}

	function check(mod, name) {
		if (data.sync[name]) {
			mod.initialize();
			data.sync[name] = false;
		}
	}
}

$(document).ready(function() {

	window.storage   = new Storage();
	window.audio     = new Audio(data);
	window.player    = new Player(audio);
	window.playlists = new Playlists(data);
	window.es        = new EndlessScroll();
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
});