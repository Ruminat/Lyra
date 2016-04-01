function mainUI(win, vk) {
	var that = this;
	this.ui = {
		songs: {
			painted: false,
			enter: false,
			scroll: false
		},
		savedVolume: 0
	};
	var soundRange    = new range(true, data.mouse, 'sound-progress', 'sound-line', changeVolume);
	window.localMusic = new pcMusic(this.ui);
	window.playlists  = new Playlists(data);
	
	window.ctxMenu = $('.context-menu');
	window.tip     = $('.tip');
	var ctxDelay   = new delay(500, function() { ctxMenu.css('display', 'none'); });

	this.focus = function(id) {
	  data.typing = true;
	  $(id).focus();
	}
	this.changeScroll = [function() {
		that.ui.songs.scroll = true;
		songsHover();
	 }, function() {
		that.ui.songs.scroll = false;
		songsHover();
	}];

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

		ctxMenu.hover(function() {
			ctxDelay.cancel();
		}, function() {
			ctxDelay.call();
		});
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

	$(document).click(function(e)     { ctxDelay.run(); });
	$(document).mousemove(function(e) { data.mouse.move(e); });
	$(window).resize(function()       { audio.changeScreenSize(); });
	$(document).mouseup(function() {
		data.mouse.move = function(e){};
		data.mouse.up();
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
	$('.songs').on('click', '.song', function() {
		var Class = $(this)[0].className;
		if (Class.indexOf('pick') == -1) {
			if (player.playing != -1) $('#'+ player.id).removeClass('activeC-low');
			player.ChangeElemSong($(this).context, $(this));
    	player.makeShuffle();
		}
	});
	//Crap
	$('.songs').hover(function() {
		that.ui.songs.enter = true;
		songsHover();
	 }, function() {
	 	that.ui.songs.enter = false;
		songsHover();
	});
	$('.with-tip').hover(function(e) {
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
		else { y = offset.top - tip.height() - height - padding; }

		tip.css('left', x +'px');
		tip.css('top',  y +'px');

	 }, function() {
		$('.tip').css('display', 'none');
	});
	$('.win').on('click', '#close-win, #folders-cancel', function() {
		$('.win').css('display', 'none');
	});
	//Add songs
	$('.songs').on('click', '.pick', function() {
		$(this).toggleClass('active');
	});
	$('.pickAll').click(function() {
		$('.song').addClass('active');
	});
	$('.addSongs .cancel').click(function() {
		addSongsCancel();
	});
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
	function songsHover() {
		if (that.ui.songs.enter || that.ui.songs.scroll) {
			$('.songs').css('opacity', '1');
			$('canvas').css('opacity', '0.1');
		} else {
			$('.songs').css('opacity', '0.5');
			$('canvas').css('opacity', '1');
		}
	}
}

module.exports = mainUI;