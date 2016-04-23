function player(audio) {
	var that          = this;
	var isTimeMoving  = false;
	this.timingPeriod = 250;
	this.duration     = 0;
	this.list         = [];
	this.shuffleList  = [];
	this.playing      = -1;
	this.id           = '';
	this.shuffle      = false;
	this.repeat       = false;
	this.stats        = new delay(50, function() { updateStats() });
	this.timing       = function(){};

	var range = new Range(false, data.mouse, 'player-progress', 'player-line', checkTime, movingTime);

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
	this.loadImage    = function(artist) {
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
	this.makeShuffle  = function() {
		var id = (that.playing == -1) ? 0 : that.playing;

		var t = that.shuffleList[id];
		that.shuffleList[id] = that.shuffleList[0];
		that.shuffleList[0] = t;

		shuffle(that.shuffleList, 1);
	}
	this.nextSong     = function() { audio.changeSong(1, that.shuffle ? that.shuffleList : that.list); }
	this.prevSong     = function() { audio.changeSong(0, that.shuffle ? that.shuffleList : that.list); }
	this.changeSong   = function(src, title, artist, duration) {
		audio.elem.src = src;
		that.duration = duration;
		that.loadImage(artist);
    audio.play();
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
	this.findSong     = function(id, playlist) {
		//I don't know why, but this piece of crap doesn't work with forEach
		var list = playlist || (that.shuffle ? that.shuffleList : that.list);
		for (var c = 0; c < list.length; c++){
			if (id == list[c]) return c;
		}
		return -1;
	}
	this.getSongData  = function(elem) {
		var children = elem.children[0].children;
		var result = {};

		result.id  = elem.attributes.id.nodeValue;
		result.url = elem.attributes.url.nodeValue;
		result.title = children[1].innerText;
		
		if (isSet(elem.attributes.owner))  { result.owner  = elem.attributes.owner.nodeValue;  }
		if (isSet(elem.attributes.lyrics)) { result.lyrics = elem.attributes.lyrics.nodeValue; }
		
		if (children.length == 3) {
			var parts = result.title.split('-');
			if (parts.length == 2) {
				result.artist = parts[0];
				result.title  = parts[1];
			} else { 
				result.artist = ''; 
			}
			result.duration = children[2].innerText;
		} else {
			result.artist   = children[2].innerText;
			result.duration = children[3].innerText;
		}

		result.type = result.id.substr(0, 2);

		return result;
	}
	this.songHtml     = function(type, id, url, title, artist, duration, addition, options) {
		var is = {download: false, delete: false, lyrics: false, add: false}
		if (isSet(options)) {
			if (isSet(options.download)) is.download = options.download;
			if (isSet(options.delete))   is.delete   = options.delete;
			if (isSet(options.lyrics))   is.lyrics   = options.lyrics;
			if (isSet(options.add))      is.add      = options.add;
		}
		var more   = isSet(addition) ? addition : ``;
		var Class  = `song`+ (type == `pc` ? ` local` : ``) + (artist == `` ? ` no-artist` : ``);
		var Artist = (artist != ``) ? `<li class="artist">${artist}` : ``;
		var download = (is.download) ? `<li><div class="download icon with-tip" data="Скачать"></div>\n`   : ``;
		var lyrics   = (is.lyrics)   ? `<li><div class="lyrics icon with-tip" data="Текст песни"></div>\n` : ``;
		var dlt      = (is.delete)   ? `<li><div class="delete icon with-tip" data="Удалить"></div>\n`     : ``;
		var add      = (is.add)      ? `<li><div class="add icon with-tip" data="Добавить"></div>\n`       : ``;
		var result =
		 `<div class="${Class}" id="${type}-${id}" `
		+`url="${url}" ${more}>`
			+`<ul>`
				+`<li class="check">`
				+`<li class="title">${title}`
				+`${Artist}`
				+`<li class="duration"><p>${duration}</p>`
				+`<ul class="song-icons">${download}${lyrics}${dlt}${add}</ul>`
			+`</ul>`
		+`</div>`;

		return result;
	}
	this.ChangeElemSong = function(elem) {
		elem.addClass('activeC-low');

		var info = that.getSongData(elem[0]);

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

		that.id = info.id;
		that.playing = that.findSong(info.id);
	}
	this.songsClick = function() {
		console.log('ТРИВОГА!!! АЛЯРМА! songsClick!');
		that.stats.call();
	}
	
	function updateStats() {
		$('#songs-num').text(that.list.length +' Аудиозаписей');
		$('.songs .empty').css('display', 'none');
	}
	//Displays current time, moves progress bar
	function updateTime() {
		var time  = audio.elem.currentTime;
		var per   = time / parseTime(that.duration);
		var width = $('.player .progress').width() * per;

		$('#time-current').text(parseSec(Math.round(time)));
		if (!isTimeMoving) {
			$('.player .line').css('width', width + 'px');
		}
	}
	this.changeTime = function(val) {
		var time = audio.elem.duration * val;
		audio.elem.currentTime = time;
		$('#time-current').text(parseSec(Math.round(time)));
		$('#player-line').css('width', ($('#player-progress').width() * val) +'px');
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
	function checkTime() {
		var per = $('#player-line').width() / $('#player-progress').width();
		isTimeMoving = false;
		that.changeTime(per);
	}
	function movingTime() { isTimeMoving = true; }
}

module.exports = player;