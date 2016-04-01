function player(audio) {
	var that = this;
	var isTimeMoving = false;

	this.timingPeriod = 250;
	this.duration = 0;
	this.list = [];
	this.shuffleList = [];
	this.playing = -1;
	this.id = '';
	this.shuffle = false;
	this.repeat = false;
	this.stats = new delay(50, function() { updateStats() });
	this.timing = function(){};

	this.add = function(song) {
		that.list.push(song);
		that.shuffleList.push(song);
		that.stats.call();
	}
	this.emptySongs = function() {
		$('#songs-wrap').html('');
		that.list = [];
		that.shuffleList = [];
		that.stats.call();
	}
	//Load music artist image from Deezer
	this.loadImage = function(artist) {
	  if (data.connection) {
	  	var url = 'http://api.deezer.com/search/artist?q=artist:"'+ artist +'"';
		  $.get(url, function(res) {
		  	var picture;

		  	try {
		  		picture = res.data[0].picture_big;
		  	} catch(err) {
		  		picture = '../img/png-jpg/lp.png';
		  	}

		  	$('.menu .album').css('background-image', 'url('+ picture +')');
		  });
	  }
	}
	this.changeTime = function(val) {
		var time = audio.elem.duration * val;
		audio.elem.currentTime = time;
		$('#time-current').text(parseSec(Math.round(time)));
		$('#player-line').css('width', ($('#player-progress').width() * val) +'px');
	}

	this.makeShuffle = function() {
		var id = (that.playing == -1) ? 0 : that.playing;

		var t = that.shuffleList[id];
		that.shuffleList[id] = that.shuffleList[0];
		that.shuffleList[0] = t;

		shuffle(that.shuffleList, 1);
	}

	this.nextSong = function() {
		audio.changeSong(1, that.shuffle ? that.shuffleList : that.list);
	}
	this.prevSong = function() {
		audio.changeSong(0, that.shuffle ? that.shuffleList : that.list);
	}
	this.changeSong = function(src, title, artist, duration) {
		//You need to fix it. Range goes out of borders
		var Range = new range(false, data.mouse, 'player-progress', 'player-line', checkTime, movingTime);
		audio.elem.src = src;
		that.loadImage(artist);
		that.duration = duration;
    audio.play();
    // $('.menu .artist').text(artist == '' ? ' ' : artist);
    // $('.menu .title').text(title);
    checkTitle('.menu .artist', artist);
    checkTitle('.menu .title', title);
    $('.player .title').text(artist == '' ? title : artist + ' - ' + title);
    $('.player .right').text(duration);

    function checkTitle(elem, what) {
    	if (what == '') {
    		$(elem).text('invisible');
    		$(elem).css('opacity', '0');
    	} else {
    		$(elem).text(what);
    		$(elem).css('opacity', '1');
    	}
    }
	}
	this.changeVolume = function(val) {
		audio.elem.volume = val;
		$('#sound-value').text(Math.round(val * 100) + '%');
		$('#sound-line').css('width', (val * $('#sound-progress').width()) +'px');
	}
	this.findSong = function(id, playlist) {
		//I don't know why, but this piece of crap doesn't work with forEach
		var list = playlist || (that.shuffle ? that.shuffleList : that.list);
		for (var c = 0; c < list.length; c++){
			if (id == list[c]) return c;
		}
		return -1;
	}

	this.startTiming = function() {
		that.timing = function() {
			updateTime();
			setTimeout(function() { that.timing(); }, that.timingPeriod);
		}

		that.timing();
	}
	this.pauseTiming = function() {
		that.timing = function(){};
		that.timingCount = 0;
	}

	this.getSongData = function(elem) {
		var children = elem.children[0].children;
		var title, artist, duration, id, url;

		id  = elem.attributes.id.nodeValue;
		url = elem.attributes.url.nodeValue;
		title = children[1].innerText;
		
		if (children.length == 3) {
			var parts = title.split('-');
			if (parts.length == 2) {
				artist = parts[0];
				title  = parts[1];
			} else { 
				artist = ''; 
			}
			duration = children[2].innerText;
		} else {
			artist   = children[2].innerText;
			duration = children[3].innerText;
		}

		return {title: title, artist: artist, duration: duration, id: id, url: url};
	}
	this.songHtml = function(type, id, url, title, artist, duration) {
		var result =
		'<div class="song'+ (type == 'pc' ? ' local' : '') + (artist == '' ? ' no-artist' : '') +
		'" id="'+ type +'-'+ id +'" url="'+ url +'">'+
			'<ul>'+
				'<li class="check">'+
				'<li class="title">'+ title;
			if (artist != '') result += '<li class="artist">'+ artist;
		result +=
				'<li class="duration">'+ duration +
			'</ul>'+
		'</div>';

		return result;
	}
	this.ChangeElemSong = function(context, elem) {
		elem.addClass('activeC-low');

		var info = that.getSongData(elem[0]);
		/*var title, artist, duration, src, children;
		children = context.children[0].children;
		src = context.attributes.url.nodeValue;

		if (children.length == 4) {
			title    = children[1].innerText;
			artist   = children[2].innerText;
			duration = children[3].innerText;
		} else {
			var parts = children[1].innerText.split('-');
			artist    = parts[0];
			title     = parts[1];
			duration  = children[2].innerText;
		}*/
		if (info.duration != '') {
			that.changeSong(info.url, info.title, info.artist, info.duration);
		} else {
			audio.elem.oncanplay = function() {
				info.duration = parseSec(audio.elem.duration);
				that.changeSong(info.url, info.title, info.artist, info.duration);
				audio.elem.oncanplay = function(){};
			}
			audio.elem.src = info.url;
		}

		that.id = context.id;
		that.playing = that.findSong(context.id);
	}
	this.songsClick = function() {
		console.log('ТРИВОГА!!! АЛЯРМА! songsClick!');
		that.stats.call();
	}
	this.songsScroll = function() {
		var songs = new scroll('songs-scroll', 'songs-scroller', 'songs-wrap', data.mouse, mainUI.changeScroll);
	}

	function updateStats() {
		$('#songs-num').text(that.list.length +' Аудиозаписей');
		$('.songs .empty').css('display', 'none');
	}
	//Displays current time, moves progress bar
	function updateTime() {
		var time = audio.elem.currentTime;
		var per = time / parseTime(that.duration);
		var width = $('.player .progress').width() * per;

		$('#time-current').text(parseSec(Math.round(time)));
		if (!isTimeMoving) {
			$('.player .line').css('width', width + 'px');
		}
	}
	function checkTime() {
		var per = $('#player-line').width() / $('#player-progress').width();
		isTimeMoving = false;
		that.changeTime(per);
	}
	function movingTime() { isTimeMoving = true; }
}

module.exports = player;