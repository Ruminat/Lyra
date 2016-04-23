function mainUI(win, vk) {
	var that = this;
	this.ui = {
		songs: {
			painted: false,
			enter: false,
			scroll: false,
			state: 'idle'
		},
		savedVolume: 0
	};
	
	window.localMusic = new PcMusic(this.ui);
	window.checkers   = new Checkers();
	
	var searchElem  = $('#search-container');
	window.ctxMenu  = $('.context-menu');
	window.tip      = $('.tip');
	var ctxDelay    = new delay(500, function() { ctxMenu.css('display', 'none');    });
	var searchDelay = new delay(500, function() { searchElem.css('display', 'none'); });

	var srch = {
		by: new checkers.radio('.search .artist-title'),
		sort: new checkers.radio('.search .sort .choose'),
		checks: new checkers.checks(['#srch-text-only']),
		pos: 0,
		count: 100
	}

	this.focus = function(id) {
	  data.typing = true;
	  $(id).focus();
	}
	this.changeScroll = [function() {
		that.ui.songs.scroll = true;
		that.songsHover();
	 }, function() {
		that.ui.songs.scroll = false;
		that.songsHover();
	}];

	this.setUpMenu = function(e, sections, cb) {
		var html = '';
		sections.forEach(function(item, i, arr) {
			html += '<div class="'+ item[0] +'">'+ item[1] +'</div>';
		});
		ctxMenu.html(html);
		that.callMenu(e);

		if (isSet(cb)) cb();
	}
	this.callMenu = function(e) {
		ctxMenu.css('display', 'flex');

		var width = ctxMenu.width();
		var height = ctxMenu.height();

		if (e.pageX < $(document).width() / 2)  width  = 0;
		if (e.pageY < $(document).height() / 2) height = 0;

		var w = e.pageX - width;
		var h = e.pageY - height;

		ctxMenu.css('left', w +'px');
		ctxMenu.css('top', h +'px');

		ctxDelay.call();
	}
	this.inActive = function(condition, sections, cls, desc) {
		if (condition) {
			sections.push([cls, desc]);
		} else {
			sections.push([cls+ ' inactive', desc]);
		}
	}
	this.songsHover = function() {
		if (that.ui.songs.enter || that.ui.songs.scroll || !audio.playing) {
			$('.songs').css('opacity', '1');
			$('canvas').css('opacity', '0.1');
		} else {
			$('.songs').css('opacity', '0.5');
			$('canvas').css('opacity', '1');
		}
	}

	$(document).keydown(function(e) {
		//Space 
		if (e.keyCode == 32) {
			if (!data.typing) {
				e.preventDefault();
				audio.toggle();
				return false;
			}
		}
	});

	$(document).on('focus', 'input', function() { data.typing = true;  });
	$(document).on('blur',  'input', function() { data.typing = false; });
	$(document).mousemove(function(e) { data.mouse.move(e); });
	$(window).resize(function()       { audio.changeScreenSize(); });
	$(document).mouseup(function() {
		data.mouse.move = function(e){};
		$('.select').removeClass('no-select');
		changeVolume();
	});
	$(document).click(function(e) {
		ctxDelay.run();
		searchDelay.run();
	});

	ctxMenu.on('click', '.inactive', function(e) { 
		if (data.check) {
			e.stopImmediatePropagation();
		} 
	 });
	 $('#search-container').click(function(e) {
		if (data.check) {
			e.stopImmediatePropagation();
		}
	});

	$('#main-settings').click(function() { vk.logout(win, data); });
	$('#empty').click(function()         { player.emptySongs(); });
	//Player buttons
	$('#play-pause').click(function()    { audio.toggle(); });
	$('#next-song').click(function()     { player.nextSong(); });
	$('#prev-song').click(function()     { player.prevSong(); });
	$('#repeat').click(function() {
		player.repeat = !player.repeat; 
		$(this).toggleClass('active-low');
	});
	$('#shuffle').click(function() {
		player.shuffle = !player.shuffle; 
		$(this).toggleClass('active-low');
	});
	$('#volume-icon').click(function() {
		if (audio.elem.volume == 0) {
			player.changeVolume(ui.savedVolume);
		} else {
			ui.savedVolume = audio.elem.volume;
			player.changeVolume(0);
		}
	});

	$('.songs').on('click', '.title, .artist', function() {
		var elem = $(this).parent().parent();
		var Class = elem[0].className;
		// vk.download(elem);
		if (Class.indexOf('pick') == -1) {
			if (player.playing != -1) $('#'+ player.id).removeClass('activeC-low');
			player.ChangeElemSong(elem);
    	player.makeShuffle();
		}
	});
	$('.songs').on('click', '.lyrics', function() {
		var elem = songsIconParent($(this));
		var info = player.getSongData(elem[0]);
		vk.request('audio.getLyrics', 'lyrics_id='+ info.lyrics, function(res) {
			if (isSet(res.response)) {
				applyText(res.response.text);
			} else {
				rejectLyrics();
			}
		});
		function rejectLyrics() {
			$('.win').css('display', 'flex');
			var text = 'Текст аудиозаписи не найден.';
			applyText(text);
		}
		function applyText(text) {
			$('.win').css('display', 'flex');

			var title = info.artist == '' ? info.title : info.artist + ' - ' + info.title;
			var html = '<h4>'+ title +'</h4>';
			html += '<pre class="select">'+ text +'</pre>';
			// html += '<h6>Найти текст в</h6>';
			// html += '<div class="button green-BG">Spotify</div>';
			// html += '<div class="button green-BG">Deezer</div>';
			// html += '<div class="button green-BG">Google Music</div>';

			$('#win-wrap').html(html);
		}
	});
	$('.songs').on('click', '.add, .delete', function() {
		var elem = songsIconParent($(this));
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
		var path = '';
		var elem = songsIconParent($(this));
		if (isSet(data.settings.download.path)) path = data.settings.download.path;
		vk.download(elem, path);
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
		that.inActive( (typeVK &&  mine), sections, 'edit', 'Редактировать');
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
			$(`${m} .edit${not}`).click(function() {
				console.log('Edit');
			});
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
			$('.win').css('display', 'flex');
			var text = 'Текст аудиозаписи не найден.';
			applyText(text);
		}
		function applyText(text) {
			$('.win').css('display', 'flex');

			var title = info.artist == '' ? info.title : info.artist + ' - ' + info.title;
			var html = '<h4>'+ title +'</h4>';
			html += '<pre class="select">'+ text +'</pre>';

			$('#win-wrap').html(html);
		}
	});
	//Crap
	$('.songs').hover(function() {
		that.ui.songs.enter = true;
		that.songsHover();
	 }, function() {
	 	that.ui.songs.enter = false;
		that.songsHover();
	});
	$('.main').on('mouseenter', '.with-tip', function() {
		var padding = 10;
		tip.html('<div>'+ $(this)[0].attributes.data.nodeValue +'</div>');
		tip.css('display', 'flex');

		var border = parseInt($(this).css('borderWidth')) * 2;
		var offset = $(this).offset(), x, y;
		var width  = $(this).width()  + border;
		var height = $(this).height() + border;

		if (offset.left < $(document).width()  / 2) { x = offset.left + width / 2; }
		else { x = offset.left - tip.width() + width / 2; }

		if (offset.top  < $(document).height() / 2) { y = offset.top + height; }
		else { y = offset.top - tip.height() - padding; }

		tip.css('left', x +'px');
		tip.css('top',  y +'px');
	 });
	 $('.main').on('mouseleave', '.with-tip', function() {
		$('.tip').css('display', 'none');
	});
	$('.win').on('click', '#close-win, #folders-cancel', function() {
		$('.win').css('display', 'none');
	});
	$('#search-parameters-shower').click(function(e) {
		searchElem.css('display', 'block');
		searchDelay.call();
		e.stopImmediatePropagation();
	});
	searchElem.hover(function() {
		searchDelay.cancel();
	 }, function() {
	 	searchDelay.call();
	});
	ctxMenu.hover(function() {
		ctxDelay.cancel();
	 }, function() {
		ctxDelay.call();
	});
	$('#search-box').keydown(function(e) {
		//enter
		if (e.keyCode == 13) {
			var lyrics = isChecked($('#srch-text-only').parent()[0]) ? 1 : 0;
			var artist = $('.search .artist-title')[0].children;
			artist = isChecked(artist[0]) ? 0 : 1;
			var sort = $('.search .choose')[0].children;
			for (var c = 0; c < sort.length; c++) {
				if (isChecked(sort[c])) {
					sort = 2 - c; break;
				}
			}
			var params = `lyrics=${lyrics}&sort=${sort}&performer_only=${artist}`;
			srch.pos = 0;
			srch.query = `q=`+ $(this).val() +`&count=${srch.count}&auto_complete=1&`+ params;

			vk.request('audio.search', srch.query, function(res) {
				if (isSet(res)) {
					player.emptySongs();
					var model = vk.addSongs(res.response.items);

					$('.songs .wrapper').html(model);
			    player.makeShuffle();
			    player.stats.call();
			    $('#srch-total-found').text('Всего найдено: '+ formatNumber(res.response.count));

			    data.state = 'search';
			    playlists.turnPlaylist();
				}
			});
			function isChecked(what) { return what.className.indexOf('checked') != -1; }
		}
	});
	//Add songs
	$('.songs').on('click', '.pick', function() { $(this).toggleClass('active'); });
	$('.pickAll').click(function()              { $('.song').addClass('active'); });
	$('.addSongs .cancel').click(function()     { addSongsCancel(); });
	$('#push-songs').click(function() {
		var songs = $('.song.active');
		var list = [], IDs = [[]];

		for (var c = 0; c < songs.length; c++){
			playlists.sortSongInfo(songs[c], list, IDs);
		}

		playlists.addSongs(list, playlists.particular, IDs);
		addSongsCancel();
	});

	function addSongsCancel() {
		$('.song').removeClass('pick');
		$('.song').removeClass('active');
		$('.addSongs').css('display', 'none');
	}
	function changeVolume() {
		var per = $('#sound-line').width() / $('#sound-progress').width();
		player.changeVolume(per);
	}
	function songsIconParent(elem) {
		return elem.parent().parent().parent().parent().parent();
	}

	var soundRange = new Range(true, data.mouse, 'sound-progress', 'sound-line', changeVolume);
	var winScroll  = new Scroll('win-scroll',    'win-scroller',   'win-wrap',   data.mouse);
	var songs      = new Scroll('songs-scroll',  'songs-scroller', 'songs-wrap', data.mouse, that.changeScroll);

	$('#songs-wrap').scroll(function() {
		if (data.state == 'search') {
			var elem   = document.getElementById('songs-wrap');
			var h      = elem.scrollHeight - $(this).height();
			var scroll = $(this).scrollTop();

			if (h == scroll) {
				srch.pos = player.list.length;
				var query = srch.query + `&offset=${srch.pos}`;
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

module.exports = mainUI;