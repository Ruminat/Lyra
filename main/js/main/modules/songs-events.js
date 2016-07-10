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
	$('.songs').on('click', '.lyrics:not(.inactive)', function() {
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
	//downloads stuff
	$('.songs').on('click', '.download:not(.in-progress)', function() {
		if (s.downloads.path != '') {
			var path = s.downloads.path;
			var elem = that.songsIconParent($(this));

			let info = player.getSongData(elem[0]);
			info.isDownloaded = false;
			info.downloaded = () => {
				info.isDownloaded = true;
				$('#d-'+ info.id).addClass('done');
			}

			$(this).addClass('in-progress');

			vk.download(info, path, () => {
				$(this).removeClass('in-progress');
				info.downloaded();
			});
			data.downloads.push(info);
		} else {
			cryingOutForError('Кажется, вы указали несуществующий путь или не указали его совсем.');
		}
	});
	$('#downloads').click(() => {
		mainUI.callWin();
		var html = '<h4>Загрузки</h4>';
		var d    = data.downloads;
		if (d.length == 0) {
			html += '<p>Нет загрузок</p>';
		} else {
			for (var c = d.length - 1; c >= 0; c--) {
				var title = isSet(d[c].artist) ? `${d[c].artist} - ${d[c].title}` : d[c].title;
				html += `<div class="item download${d[c].isDownloaded ? ' done' : ''}" id="d-${d[c].id}">`+
					`<p class="title">${title}</p>`+
					`<div class="icon with-tip" data="Открыть папку с загрузками"></div>`+
				`</div>`;
			}
		}
		$('#win-wrap').html(html);
		$('.win .download .icon').click(() => { shell.openItem(s.downloads.path); });
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
}

module.exports = SongsEvents;