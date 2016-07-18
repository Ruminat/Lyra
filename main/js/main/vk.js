function vk(data, player) {
	var that = this;
	const v  = '5.52';

	//Parse login data (id, token)
	this.parseLogin = function(win) {
	  var url = win.getURL();
	  var str = 'index.html#DATA:';
	  var pos = url.indexOf(str) + str.length;
	  var txt = url.substr(pos, url.length);

	  if (txt != 'offline') {
			var result   = {};
			var values   = txt.split('&');
			result.token = values[0].split('=')[1];
			result.id    = values[2].split('=')[1];
	    return result;
	  } else {
	    return false;
	  }
	}

	this.download = function(info, path, cb) {
		var parsedUrl = URL.parse(info.url);
		var file = fs.createWriteStream(`${path}${info.artist} - ${info.title}.mp3`);
		var options = {
			host: parsedUrl.host,
			path: parsedUrl.path
		};

		http.request(options, (res) => {
			res.on('data', (part) => {
				file.write(part);
			});
			res.on('end', () => {
				file.close();
				if (isSet(cb)) cb();
			});
		}).end();
	}

	this.online = function() {
		$('#search-box').css('display', 'block');
		$('#search-parameters-shower').css('display', 'block');
		$('.vk').css('display', 'block');
	}

	this.resItems = (res) => {
		if (isSet(res)) {
			if (isSet(res.response.items)) return res.response.items
			else return res.response;
		} else return [];
	}

	this.APImethod = function(method, url) {
		return `https://api.vk.com/method/${method}?${url}v=${v}&access_token=${data.vk.token}`;
	}

	this.request = function(method, parameters, cb) {
		if (data.connection && isSet(data.vk)) {
			var url = `https://api.vk.com/method/${method}?` +
		            (parameters == '' ? '' : parameters + '&') +
		            `user_id=${data.vk.id}&` +
		            `v=${v}&access_token=${data.vk.token}`;
		  $.get(url, function(res) {
		  	if (isSet(cb)) cb(res);
		  });
		} else if (isSet(cb)) { cb(); }
	}

	this.addSongs = function(songs) {
		var model = '';
		songs.forEach(function(item, i, arr) {
    	player.add('vk-'+ item.id);
    	var lyrics = '';
    	if (isSet(item.lyrics_id)) lyrics = ` lyrics="${item.lyrics_id}"`;
    	var addition = `owner="${item.owner_id}"${lyrics}`;
    	var lyrics   = isSet(item.lyrics_id);
    	var add      = false;
    	if (isSet(item.owner_id)) add = item.owner_id != data.vk.id;
    	var options  = {download: true, delete: !add, lyrics: lyrics, add: add};
      model += player.songHtml('vk', item.id, item.url, item.title, item.artist, parseSec(item.duration), addition, options);
    });
		return model;
	}

	this.getAudio = function(id) {
		playlists.startLoad('with-songs');
		player.emptySongs();
		if (isSet(id)) playlists.turnPlaylist();

		var url = that.APImethod('audio.get', `owner_id=${id || data.vk.id}&`);

		$.get(url, (res) => {
			if (isSet(res) && isSet(res.response)) {
	  		var model = that.addSongs(res.response.items);
		    $('.songs .wrapper').html(model);
		    player.makeShuffle();
		    player.stats.call();
		  //If there is an id, then we're trying to access to someone else's audio
	  	} else if (isSet(id)) {
	  		cryingOutForError('Вконтакте не хочет возвращать аудиозаписи этого пользователя (если таковые вообще имеются).');
	  	} else {
	  		cryingOutForError('Вконтакте не хочет возвращать аудиозаписи. Попробуйте перезапустить Lyra.');
	  	}
	  	playlists.stopLoad('with-songs');
		});
	}

	//There is no logout method in VK API, so I made this... thing
	this.logout = function() {
	  $.get('https://vk.com', function(res) {
	    //parse hash from quit button
	    var search = '<a class="top_nav_link" id="logout_link" href=';
	    var pos = res.indexOf(search);
	    //search in new vk version
	    if (pos == -1) {
	    	search = 'class="top_profile_mrow" id="logout_link" href=';
	    	pos = res.indexOf(search);
	    }
	    var url = res.substr(pos + search.length, 250);
	    $.get(url.split('"')[1], function(res) {
	    	win.loadURL('file://' + __dirname + '/../../views/authentication.html');
	    });
	  });
	}
}

module.exports = vk;