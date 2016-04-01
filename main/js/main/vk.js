function vk(data, player) {
	var that = this;
	//Parse login data (id, token)
	this.parseLogin = function(win) {
	  var url = win.getUrl();
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

	this.getAudio = function() {
		player.emptySongs();
	  var url = 'https://api.vk.com/method/audio.get?'
	            +'user_id=-'+ data.vk.id +'&'
	            +'v=5.40&access_token='+ data.vk.token;
	  $.get(url, function(res, status) {
	    var model = '';
	    res.response.items.forEach(function(item, i, arr) {
	    	player.add('vk-'+ item.id);
	      model += player.songHtml('vk', item.id, item.url, item.title, item.artist, parseSec(item.duration));
	    });

	    $('.songs .wrapper').html(model);
	    player.makeShuffle();

	    player.songsScroll();
	    player.stats.call();
	  });
	}

	this.request = function(method, parameters, cb) {
		if (data.connection && isSet(data.vk)) {
			var url = 'https://api.vk.com/method/'+ method +'?'+
		            parameters +
		            '&user_id=-'+ data.vk.id +'&' +
		            'v=5.40&access_token='+ data.vk.token;
		  $.get(url, function(res) {
		  	if (isSet(cb)) cb(res);
		  });
		} else if (isSet(cb)) { cb(); }
	}

	this.logout = function(win, data) {
	  $.get('https://vk.com', function(res) {
	    //parse hash from quit button
	    var search = '<a class="top_nav_link" id="logout_link" href=';
	    var url = res.substr(res.indexOf(search) + search.length, 250);
	    $.get(url.split('"')[1], function() {
	    	win.loadUrl('file://' + __dirname + '/../../views/authentication.html');
	    });
	  });
	}
	this.APImethod = function(url) {
		return 'https://api.vk.com/method/'+ url +'v=5.40&access_token='+ data.vk.token;
	}
}

module.exports = vk;