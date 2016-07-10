function player(audio) {
	var that          = this;
	var isTimeMoving  = false;
	this.loaded       = false;
	this.timingPeriod = 250;
	this.duration     = 0;
	this.list         = [];
	this.shuffleList  = [];
	this.playing      = -1;
	this.id           = '';
	this.shuffle      = false;
	this.repeat       = false;
	this.stats        = new delay(50, function() { updateStats(); });
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
	this.loadImage   = function(artist) {
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
	this.makeShuffle = function() {
		var id = (that.playing == -1) ? 0 : that.playing;

		var t = that.shuffleList[id];
		that.shuffleList[id] = that.shuffleList[0];
		that.shuffleList[0] = t;

		shuffle(that.shuffleList, 1);
	}
	this.nextSong   = ()     => { audio.changeSong(1, that.shuffle ? that.shuffleList : that.list); }
	this.prevSong   = ()     => { audio.changeSong(0, that.shuffle ? that.shuffleList : that.list); }
	this.changeSong = (info) => {
		audio.elem.oncanplay = function() {
			that.duration = parseSec(audio.elem.duration);
			$('.player .right').text(that.duration);
			audio.elem.oncanplay = function() {};
		}
		that.duration  = info.duration;
		audio.elem.src = info.url;

		audio.loaded   = 0;
		that.loaded    = false;
		that.loadImage(info.artist);
		audio.play();
    checkTitle('.menu .artist', info.artist);
    checkTitle('.menu .title',  info.title);
    $('.player .title').text(info.artist == '' ? info.title : info.artist + ' - ' + info.title);
    $('.player .right').text(info.duration);
    $('.player .loaded').css('width', '0');

    if (that.id.substr(0, 2) == 'vk' && s.status) {
    	var id = that.id.substr(3, that.id.length);
    	vk.request('audio.setBroadcast', `audio=${data.vk.id}_${id}`);
    }

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
	this.changeVolume   = function(val) {
		audio.elem.volume = val;
		$('#sound-value').text(Math.round(val * 100) + '%');
		$('#sound-line').css('width', (val * $('#sound-progress').width()) +'px');
		storage.changeSaved(() => { saved.volume  = val; });
	}
	this.findSong       = function(id, playlist) {
		//I don't know why, but this piece of crap doesn't work with forEach
		var list = playlist || (that.shuffle ? that.shuffleList : that.list);
		for (var c = 0; c < list.length; c++){
			if (id == list[c]) return c;
		}
		return -1;
	}
	this.getSongData    = function(elem) {
		var children = elem.children[0].children;
		var result   = {};

		result.id    = elem.attributes.id.nodeValue;
		result.url   = elem.attributes.url.nodeValue;
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
			result.duration = children[2].children[0].innerText;
		} else {
			result.artist   = children[2].innerText;
			result.duration = children[3].children[0].innerText;
		}

		result.type = result.id.substr(0, 2);

		return Object.assign({}, result);
	}
	this.songHtml       = function(type, id, url, title, artist, duration, addition, options) {
		var is = {download: false, delete: false, lyrics: false, add: false}
		if (isSet(options)) {
			if (isSet(options.download)) is.download = options.download;
			if (isSet(options.delete))   is.delete   = options.delete;
			if (isSet(options.lyrics))   is.lyrics   = options.lyrics;
			if (isSet(options.add))      is.add      = options.add;
		}
		var cls      = `song`+ (type == `pc` ? ` local` : ``) + (artist == `` ? ` no-artist` : ``);
		var more     = isSet(addition) ? addition : '';
		var Artist   = (artist != ``)  ? `<li class="artist">${artist}` : ``;
		var download = (is.download)   ? `<li><div class="download icon with-tip" data="Скачать"></div>`   + `\n` : '';
		var dlt      = (is.delete)     ? `<li><div class="delete icon with-tip" data="Удалить"></div>`     + `\n` : '';
		var add      = (is.add)        ? `<li><div class="add icon with-tip" data="Добавить"></div>`       + `\n` : '';

		var lyrics   = type == 'vk' ? `<li><div class="lyrics icon${is.lyrics ? '' : ' inactive'} with-tip" data="Текст песни"></div>\n` : '';

		var result   =
		 `<div class="${cls}" id="${type}-${id}" `
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
		that.changeSong(info);

		that.id = info.id;
		that.playing = that.findSong(info.id);
	}

	this.switch = (what) => {
		if (what == 'shuffle') {
			that.shuffle = !that.shuffle;
			storage.changeSaved(() => { saved.shuffle = that.shuffle; });
		} else {
			that.repeat = !that.repeat;
			storage.changeSaved(() => { saved.repeat  = that.repeat;  });
		}

		$('#'+ what).toggleClass('active-low');
	}

	this.initialize = () => {
		storage.saved = saved;
		if (isSet(saved.volume)) that.changeVolume(saved.volume);
		if (isSet(saved.shuffle) && saved.shuffle != that.shuffle) that.switch('shuffle');
		if (isSet(saved.repeat)  && saved.repeat  != that.repeat)  that.switch('repeat');
	}
	
	function updateStats() {
		$('#songs-num').text(that.list.length +' Аудиозаписей');
		$('.songs .empty').css('display', 'none');
		mainUI.checkScrolls();

		mainUI.ui.songs.list = $('#songs-wrap')[0].children;
	}
	//Displays current time, moves progress bar
	function updateTime() {
		var time   = audio.elem.currentTime;
		var dur    = parseTime(that.duration)
		var per    = time / dur;
		var width  = $('.player .progress').width();
		var loaded = audio.loaded / dur;

		if (!that.loaded) 
			$('.player .loaded').css('width', (width * loaded) + 'px');

		if (Math.round(audio.loaded) >= Math.round(dur) && !that.loaded) {
			that.loaded = true;
			$('.player .loaded').css('width', width + 'px');
		}
		
		$('#time-current').text(parseSec(Math.round(time)));
		if (!isTimeMoving) {
			$('.player .line').css('width', (width * per) + 'px');
		}
	}
	this.changeTime  = function(val) {
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

	synchronize('player');
}

module.exports = player;