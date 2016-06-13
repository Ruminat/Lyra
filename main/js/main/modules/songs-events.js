function SongsEvents(that) {
	$('.songs').on('click', '.title, .artist', function() {
		var elem = $(this).parent().parent();
		var Class = elem[0].className;
		if (Class.indexOf('pick') == -1) {
			if (player.playing != -1) $('#'+ player.id).removeClass('activeC-low');
			player.ChangeElemSong(elem);
    	player.makeShuffle();
		}
	});
	$('.songs').on('click', '.lyrics', function() {
		var elem = that.songsIconParent($(this));
		var info = player.getSongData(elem[0]);
		vk.request('audio.getLyrics', 'lyrics_id='+ info.lyrics, function(res) {
			if (isSet(res.response)) {
				applyText(res.response.text);
			} else {
				rejectLyrics();
			}
		});
		function rejectLyrics() {
			that.callWin();
			var text = 'Текст аудиозаписи не найден.';
			applyText(text);
		}
		function applyText(text) {
			that.callWin();

			var title = info.artist == '' ? info.title : info.artist + ' - ' + info.title;
			var html = '<h4>'+ title +'</h4>';
			html += '<pre class="select">'+ text +'</pre>';

			that.applyWin(html);
		}
	});
	$('.songs').on('click', '.add, .delete', function() {
		var elem = that.songsIconParent($(this));
		var info = player.getSongData(elem[0]);
		var audioID = info.id.substr(3, info.id.length);

		//Add
		if ($(this)[0].className.indexOf('delete') == -1) {
			vk.request('audio.add', `audio_id=${audioID}&owner_id=${info.owner}`, function(res) {
				if (isSet(res.response)) elem.addClass('added');
			});
		//Vk delete
		} else if (info.type == 'vk') {
			vk.request('audio.delete', `audio_id=${audioID}&owner_id=${info.owner}`, function(res) {
				if (isSet(res.response)) elem.addClass('removed');
			});
		}
	});
	$('.songs').on('click', '.download', function() {
		if (s.downloads != '') {
			var path = s.downloads.path;
			var elem = that.songsIconParent($(this));
			vk.download(elem, path);
		}
	});
	$('.songs').on('contextmenu', '.song', function(e) {
		var sections = [];
		var info     = player.getSongData($(this)[0]);
		var audioID  = info.id.substr(3, info.id.length);
		var elem     = $(this);
		var id       = info.owner;
		var mine     = id == data.vk.id;
		var typeVK   = info.type == 'vk';
		that.inActive( (typeVK && !mine), sections, 'add', 'Добавить в мои аудиозаписи');
		that.inActive(isSet(info.lyrics), sections, 'get-lyrics', 'Текст аудиозаписи');
		// that.inActive( (typeVK &&  mine), sections, 'edit', 'Редактировать');
		that.inActive((!typeVK ||  mine), sections, 'delete', 'Удалить');

		that.setUpMenu(e, sections, function() {
			var m = '.context-menu';
			var not = ':not(.inactive)';
			$(`${m} .get-lyrics${not}`).click(function(elem) {
				vk.request('audio.getLyrics', 'lyrics_id='+ info.lyrics, function(res) {
					if (isSet(res.response)) {
						applyText(res.response.text);
					} else {
						rejectLyrics();
					}
				});
			});
			/*$(`${m} .edit${not}`).click(function() {
				console.log('Edit');
			});*/
			addOrDelete(`${m} .add${not}`,    'add',    'added',   elem);
			addOrDelete(`${m} .delete${not}`, 'delete', 'removed', elem, function() {
				console.log('delete local song');
			});
		});

		function addOrDelete(element, method, cls, elem, cb) {
			$(element).click(function() {
				if (typeVK) {
					vk.request(`audio.${method}`, `audio_id=${audioID}&owner_id=${info.owner}`, function(res) {
						elem.addClass(cls);
					});
				} else if (isSet(cb)) cb();
			});
		}
		function rejectLyrics() {
			that.callWin();
			var text = 'Текст аудиозаписи не найден.';
			applyText(text);
		}
		function applyText(text) {
			that.callWin();

			var title = info.artist == '' ? info.title : info.artist + ' - ' + info.title;
			var html = '<h4>'+ title +'</h4>';
			html += '<pre class="select">'+ text +'</pre>';

			that.applyWin(html);
		}
	});
	$('.songs').hover(function() {
		that.ui.songs.enter = true;
		that.songsHover();
	 }, function() {
	 	that.ui.songs.enter = false;
		that.songsHover();
	});
	$('#songs-wrap').scroll(function() {
		if (data.state == 'search') {
			var elem   = document.getElementById('songs-wrap');
			var h      = elem.scrollHeight - $(this).height();
			var scroll = $(this).scrollTop();

			if (h == scroll) {
				that.srch.pos  = player.list.length;
				var query = that.srch.query + `&offset=${that.srch.pos}`;
				vk.request('audio.search', query, function(res) {
					if (isSet(res)) {
						var model = vk.addSongs(res.response.items);

						$('.songs .wrapper').append(model);
				    player.makeShuffle();
				    player.stats.call();
				    $('#srch-total-found').text('Всего найдено: '+ formatNumber(res.response.count));

				    data.state = 'search';
				    $('#songs-wrap').scrollTop($('#songs-wrap').scrollTop() + 1);
					}
				});
			}
		}
	});
}

module.exports = SongsEvents;