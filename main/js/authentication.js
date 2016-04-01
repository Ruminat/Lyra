var fs = require('fs');
var EventEmmiter = require('events');
//TODO:
//Fix vk window

$(document).ready(function() {
	//Interface initialization
	var data = {
		connection: navigator.onLine
	};
	var vk = {};
	var win = remote.getCurrentWindow();
	var ui = new interface(win, data);

	//If user have internet connection
	if (data.connection) {
		logVk(false);
	}
	$('#vk-in').click(function() { 
		if (data.connection) {
			logVk(true);
		} 
	});
	$('#vk-in-icon').click(function() { 
		if (data.connection) {
			logVk(true);
		} 
	});
	$('#off-in').click(function() { openMain('file://' + __dirname + '/index.html#DATA:offline'); });
	$('#off-in-icon').click(function() { openMain('file://' + __dirname + '/index.html#DATA:offline'); });

	//Close VK window when user tries to close current window
	win.on('close', function() { closeVK(); });

	function logVk(vkShow) {
		vk.win = new BrowserWindow({width: 800, height: 600, show: vkShow});
		vk.contents = vk.win.webContents;
		//Fires the when page is loaded
		vk.contents.on('did-finish-load', function() {
			var url = vk.win.getUrl();
			//If the url starts with 'https://oauth.vk.com/blank.html', i.e. the user is logged in 
			if (url.substr(0, 31) == 'https://oauth.vk.com/blank.html') {
				closeVK();
				//if request starts with 'a'ccess, not with 'e'rror, for example.
				if (url.substr(32, 1) == 'a') {
					openMain('file://' + __dirname + '/index.html#DATA:'+ url.substr(32, url.length));
				} else {
					cryingOutForError('По-видимому, проблема с ВКонтакте. Повторите попытку через несколько минут.');
				}
			} else {
				$('.loader').css('display', 'none');
				$('.login').css('display', 'block');
				win.show();
				if (vkShow) vk.win.show();
			}
		});

		//VK Authentication url
		vk.win.loadUrl('https://oauth.vk.com/authorize?'
		+'client_id=5175660&display=page&'
		+'redirect_uri=https://oauth.vk.com/blank.html&'
		+'scope=audio,friends,status&response_type=token&v=5.40');
	}

	function openMain(url) {
		closeVK();

		// var main = new BrowserWindow({width: 1200, height: 800, frame: false, show: true});
		// main.loadUrl(url);
		// main.openDevTools();
		win.loadUrl(url);
		win.removeAllListeners();
		// win.close();
	}
	function closeVK() {
		if (vk.win) {
			try {
				vk.win.close();
			} catch (err) {
				console.log(err);
			}
		}
	}
});