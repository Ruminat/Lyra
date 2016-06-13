function vk(data, player) {
	var that = this;

	// var VK = new BrowserWindow({width: 1920, height: 1080});
	// VK.loadUrl('http://vk.com');
	// VK.openDevTools();

	//Parse login data (id, token)
	this.parseLogin = function(win) {
	  var url = win.getURL();
	  var str = 'index.html#DATA:';
	  var pos = url.indexOf(str) + str.length;
	  var txt = url.substr(pos, url.length);

	  if (txt != 'offline') {
	    var result = {};
	    var values = txt.split('&');
	    result.token = values[0].split('=')[1];
	    result.id    = values[2].split('=')[1];
	    return result;
	  } else {
	    return false;
	  }
	}

	this.download = function(elem, path) {
		var info = player.getSongData(elem[0]);
		var Path = path || '';
		request(info.url).pipe(
			fs.createWriteStream(`${Path}${info.artist} - ${info.title}.mp3`)
		);
	}

	this.online = function() {
		$('#search-box').css('display', 'block');
		$('#search-parameters-shower').css('display', 'block');
	}

	this.request = function(method, parameters, cb) {
		if (data.connection && isSet(data.vk)) {
			var url = 'https://api.vk.com/method/'+ method +'?'+
		            (parameters == '' ? '' : parameters + '&') +
		            'user_id=-'+ data.vk.id +'&' +
		            'v=5.40&access_token='+ data.vk.token;
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

	this.getAudio = function() {
		playlists.startLoad('with-songs');
		player.emptySongs();

	  that.request('audio.get', '', function(res) {
	  	var model = that.addSongs(res.response.items);
	    $('.songs .wrapper').html(model);
	    player.makeShuffle();
	    player.stats.call();
	    playlists.stopLoad('with-songs');
	  });
	}

	this.logout = function() {
	  $.get('https://vk.com', function(res) {
	    //parse hash from quit button
	    var search = '<a class="top_nav_link" id="logout_link" href=';
	    var pos = res.indexOf(search);
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
	this.APImethod = function(method, url) {
		return 'https://api.vk.com/method/'+ method +'?'+ url +'v=5.40&access_token='+ data.vk.token;
	}
}

module.exports = vk;