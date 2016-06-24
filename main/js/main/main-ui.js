function mainUI(win, vk) {
	var that = this;
	this.ui = {
		songs: { 
			divScroll: 0,
			painted:   false,
			scroll:    false,
			enter:     false,
			state:     'idle',
			songH:     32,
			wrapH:     $('#songs-wrap').height(),
			list:      []
		},
		savedVolume: 0
	};
	//spw means SongsPerWrap (how many songs can feet in songs-wrap)
	that.ui.songs.spw   = low(that.ui.songs.wrapH / that.ui.songs.songH);
	that.ui.songs.range = {from: 0, to: that.ui.songs.spw + 1};
	
	window.localMusic   = new PcMusic(this.ui);
	window.checkers     = new Checkers();
	window.settings     = new Settings();
	var groups          = new Groups();
	var songsEvents     = new SongsEvents(that);
	
	var searchElem      = $('#search-container');
	window.ctxMenu      = $('.context-menu');
	window.tip          = $('.tip');
	var ctxDelay        = new delay(500, () => { ctxMenu.css('display', 'none');    });
	var searchDelay     = new delay(500, () => { searchElem.css('display', 'none'); });

	this.changeScroll = [() => {
		that.ui.songs.scroll = true;
		that.songsHover();
	 }, () => {
		that.ui.songs.scroll = false;
		that.songsHover();
	}];
	
	var soundRange      = new Range(true, data.mouse,    'sound-progress',    'sound-line',    changeVolume);
	window.winScroll    = new Scroll('win-scroll',       'win-scroller',      'win-wrap',      data.mouse);
	window.settScroll   = new Scroll('settings-scroll',  'settings-scroller', 'settings-wrap', data.mouse);
	window.songsScroll  = new Scroll('songs-scroll',     'songs-scroller',    'songs-wrap',    data.mouse, that.changeScroll, songsScrolling);

	this.srch = {
		by:     checkers.radio('.search .artist-title'),
		sort:   checkers.radio('.search .sort .choose'),
		checks: checkers.checks(['#srch-text-only']),
		pos:    0,
		count:  100
	}


	this.focus = (id) => {
	  data.typing = true;
	  $(id).focus();
	}
	this.setUpMenu = (e, sections, cb) => {
		var html = '';
		sections.forEach((item, i, arr) => {
			html += '<div class="'+ item[0] +'">'+ item[1] +'</div>';
		});
		ctxMenu.html(html);
		that.callMenu(e);

		if (isSet(cb)) cb();
	}
	this.callMenu = (e) => {
		ctxMenu.css('display', 'flex');

		var width = ctxMenu.width();
		var height = ctxMenu.height();

		if (e.pageX < $(document).width()  / 2)  width = 0;
		if (e.pageY < $(document).height() / 2) height = 0;

		var w = e.pageX - width;
		var h = e.pageY - height;

		ctxMenu.css('left', w +'px');
		ctxMenu.css('top', h +'px');

		ctxDelay.call();
	}
	this.callWin  = ()     => {
		$('.win').css('display', 'flex');
		that.checkScrolls();
	}
	this.hideWin  = ()     => { $('.win').css('display', 'none'); }
	this.applyWin = (html) => {
		$('#win-wrap').html(html);
		that.checkScrolls();
	}
	this.checkScrolls = () => {
		winScroll.check();
		songsScroll.check();
		settScroll.check();
	}
	//Make first ${spw} songs visiable
	this.makeSongsVisiable = () => {
		for (var c = 0; c <= that.ui.songs.spw + 1; c++) { 
			$(that.ui.songs.list[c]).addClass('visiable'); 
		}
	}

	this.inActive = (condition, sections, cls, desc) => {
		if (condition) {
			sections.push([cls, desc]);
		} else {
			sections.push([cls +' inactive', desc]);
		}
	}
	this.songsHover = () 		=> {
		if (that.ui.songs.enter || that.ui.songs.scroll || !audio.playing || !s.vs.on) {
			$('.songs').css('opacity', '1');
			$('canvas').css('opacity', '0.1');
		} else {
			$('.songs').css('opacity', '0.5');
			$('canvas').css('opacity', '1');
		}
	}

	$('.songs').hover(function() {
		that.ui.songs.enter = true;
		that.songsHover();
	 }, function() {
	 	that.ui.songs.enter = false;
		that.songsHover();
	});

	$(document).keydown((e) => {
		//Space 
		if (e.keyCode == 32) {
			if (!data.typing) {
				e.preventDefault();
				audio.toggle();
				return false;
			}
		}
	});

	$(document).on('focus', 'input', () => { data.typing = true;  });
	$(document).on('blur',  'input', () => { data.typing = false; });
	$(document).mousemove((e) => { data.mouse.move(e); });
	$(window).resize(()       => {
		audio.changeScreenSize();

		that.ui.songs.wrapH = $('#songs-wrap').height();
		that.ui.songs.spw   = low(that.ui.songs.wrapH / that.ui.songs.songH);
		changeSongsDisplay(that.ui.songs.divScroll);
	});
	$(document).mouseup(() 		=> {
		data.mouse.move = (e) =>{};
		$('.select').removeClass('no-select');
		changeVolume();
	});
	$(document).click((e)  		=> {
		ctxDelay.run();
		searchDelay.run();
	});

	ctxMenu.on('click', '.inactive', (e) => { 
		if (data.check) e.stopImmediatePropagation();
	 });
	 $('#search-container').click((e)    => {
		if (data.check) e.stopImmediatePropagation();
	});

	$('#empty').click(()       => { player.emptySongs(); 			});
	$('#logout').click(()      => { vk.logout(); 			   			});
	//Player buttons
	$('#play-pause').click(()  => { audio.toggle(); 		      });
	$('#next-song').click(()   => { player.nextSong();	      });
	$('#prev-song').click(()   => { player.prevSong();	      });
	$('#shuffle').click(() 		 => { player.switch('shuffle'); });
	$('#repeat').click(()  		 => { player.switch('repeat');  });
	$('#refresh').click(() 		 => {
		win.removeAllListeners();
		document.location.reload();
	});
	$('#volume-icon').click(() => {
		if (audio.elem.volume == 0) {
			player.changeVolume(ui.savedVolume);
		} else {
			ui.savedVolume = audio.elem.volume;
			player.changeVolume(0);
		}
	});

	//Crap
	$(document).on('mouseenter', '.with-tip', function() {
		if (s.tips) {
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
		}
	 });
	 $(document).on('mouseleave', '.with-tip', () => {
		$('.tip').css('display', 'none');
	});
	$('.win').on('click', '#close-win, #folders-cancel', () => {
		$('.win').css('display', 'none');
	});
	$('#search-parameters-shower').click((e) => {
		searchElem.css('display', 'block');
		searchDelay.call();
		e.stopImmediatePropagation();
	});
	searchElem.hover(() => {
		searchDelay.cancel();
	 }, () => {
	 	searchDelay.call();
	});
	ctxMenu.hover(() => {
		ctxDelay.cancel();
	 }, () => {
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
			that.srch.pos = 0;
			that.srch.query = `q=`+ $(this).val() +`&count=${that.srch.count}&auto_complete=1&`+ params;

			vk.request('audio.search', that.srch.query, (res) => {
				if (isSet(res)) {
					player.emptySongs();
					var model = vk.addSongs(res.response.items);

					$('.songs .wrapper').html(model);
			    player.makeShuffle();
			    player.stats.call();
			    $('#srch-total-found').text('Всего найдено: '+ formatNumber(res.response.count));

			    data.state = 'search';
			    playlists.turnPlaylist();
			    songsScroll.scroll(0);
			    that.makeSongsVisiable();
				}
			});
			function isChecked(what) { return what.className.indexOf('checked') != -1; }
		}
	});
	//Add songs
	$('.songs').on('click', '.pick', function() { $(this).toggleClass('active'); });
	$('.pickAll').click(()    		  		=> { $('.song').addClass('active'); });
	$('.addSongs .cancel').click(() 		=> { addSongsCancel(); 							});
	$('#push-songs').click(() 		  		=> {
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
	this.songsIconParent = (elem) => { return elem.parent().parent().parent().parent().parent(); }

	function songsScrolling($wrap) {
		var div = low($wrap.scrollTop() / that.ui.songs.songH);
		if (div != that.ui.songs.divScroll) {
			that.ui.songs.divScroll = div;
			changeSongsDisplay(div);
		}
	}
	function changeSongsDisplay(div) {
		var from  = (div < 2) ? 0 : (div - 1);
		var to    = div + that.ui.songs.spw + 1;
		if (to   >= player.list.length) to--;

		$('.song').removeClass('visiable');
		for (var c = from; c <= to; c++) { $(that.ui.songs.list[c]).addClass('visiable'); }
	}
}

module.exports = mainUI;