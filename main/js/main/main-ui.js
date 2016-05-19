//TODO:
//make a function for hiding bars (playlists, player, e.t.c)
//clear cache function
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
	var groups        = new Groups();
	var songsEvents   = new SongsEvents(that);
	var settings      = new Settings();
	
	var searchElem    = $('#search-container');
	window.ctxMenu    = $('.context-menu');
	window.tip        = $('.tip');
	var ctxDelay      = new delay(500, function() { ctxMenu.css('display', 'none');    });
	var searchDelay   = new delay(500, function() { searchElem.css('display', 'none'); });

	var soundRange    = new Range(true, data.mouse,    'sound-progress',    'sound-line',    changeVolume);
	var winScroll     = new Scroll('win-scroll',       'win-scroller',      'win-wrap',      data.mouse);
	var settScroll    = new Scroll('settings-scroll',  'settings-scroller', 'settings-wrap', data.mouse);
	var songsScroll   = new Scroll('songs-scroll',     'songs-scroller',    'songs-wrap',    data.mouse, that.changeScroll);

	var srch = {
		by:     new checkers.radio('.search .artist-title'),
		sort:   new checkers.radio('.search .sort .choose'),
		checks: new checkers.checks(['#srch-text-only']),
		pos:    0,
		count:  100
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
	this.callWin  = function()     { $('.win').css('display', 'flex'); }
	this.hideWin  = function()     { $('.win').css('display', 'none'); }
	this.applyWin = function(html) {
		$('#win-wrap').html(html);
		that.checkScrolls();
	}
	this.checkScrolls = function() {
		winScroll.check();
		songsScroll.check();
		settScroll.check();
	}

	this.inActive = function(condition, sections, cls, desc) {
		if (condition) {
			sections.push([cls, desc]);
		} else {
			sections.push([cls +' inactive', desc]);
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
		if (data.check) e.stopImmediatePropagation();
	 });
	 $('#search-container').click(function(e) {
		if (data.check) e.stopImmediatePropagation();
	});

	$('#logout').click(function()     { vk.logout(win, data); });
	$('#empty').click(function()      { player.emptySongs(); });
	//Player buttons
	$('#play-pause').click(function() { audio.toggle(); });
	$('#next-song').click(function()  { player.nextSong(); });
	$('#prev-song').click(function()  { player.prevSong(); });
	$('#repeat').click(function() {
		player.repeat = !player.repeat; 
		$(this).toggleClass('active-low');
	});
	$('#refresh').click(function() {
		win.removeAllListeners();
		document.location.reload();
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

	//Crap
	$(document).on('mouseenter', '.with-tip', function() {
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
	 $(document).on('mouseleave', '.with-tip', function() {
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
	this.songsIconParent = function(elem) { return elem.parent().parent().parent().parent().parent(); }
}

module.exports = mainUI;