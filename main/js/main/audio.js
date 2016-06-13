function audio(data) {
	var that = this;

	this.elem    = document.getElementById('audio');
	this.playing = false;
	this.loaded  = 0;

	var AudioContext = window.AudioContext;
	var ctx       = new AudioContext;
	var analyser  = ctx.createAnalyser();
	var source    = [ctx.createMediaElementSource(this.elem)];
	var dest      = ctx.destination;
	var gain      = ctx.createGain();
	var merger    = ctx.createChannelMerger(2);
	var splitter  = ctx.createChannelSplitter(2);
	var gainNode  = ctx.createGain();
	/*jsNode has to be in a global variable because there's a bug with 
	  gargabe collecting (or it's not a bug, I don't know, It only works in global. That's it, folks)*/
	window.jsNode = ctx.createScriptProcessor(2048, 1, 1);

	source[1] = source[0];

	//That's for mono
	source[0].connect(splitter);
	splitter.connect(dest, 0);
	splitter.connect(dest, 1);

	jsNode.connect(dest);
	analyser.smoothingTimeConstant = 0.3;
  analyser.fftSize = 1024;
  source[1].connect(analyser);
  analyser.connect(jsNode);

	//That's for stereo
	/*source[0].connect(gainNode);
  gainNode.connect(ctx.destination);
	jsNode.connect(ctx.destination);
	analyser.smoothingTimeConstant = 0.3;
  analyser.fftSize = 512;
  source[1].connect(analyser);
  analyser.connect(jsNode);*/


  //Canvas stuff
	var canvas = document.getElementById('canvas');
	var h      = canvas.height = $('canvas').height();
	var w      = canvas.width = $('canvas').width();
	var pi     = Math.PI;
	var lines  = [];
	var r      = 150; //radius
	var n      = 270; //number of stripes
	this.arcs  = 18;
	var screenSize = new delay(40, function() {
		h = document.getElementById('canvas').height = $('canvas').height();
		w = document.getElementById('canvas').width = $('canvas').width();
	});
	canvas    = document.getElementById('canvas').getContext('2d');
	canvas.strokeStyle = '#2F2F2F';
	for (var c = 0; c < that.arcs; c++){
		lines.push(c*pi / that.arcs);
	}

	this.changeScreenSize = function() { screenSize.call(); }

	this.play = function() {
		$('#play').css('display', 'none');
		$('#pause').css('display', 'block');
		that.elem.play();
		player.startTiming();
		that.playing = true;
		mainUI.songsHover();
	}
	this.pause = function() {
		$('#play').css('display', 'block');
		$('#pause').css('display', 'none');
		that.elem.pause();
		player.pauseTiming();
		that.playing = false;
		mainUI.songsHover();
	}
	this.toggle = function() {
		if (that.elem.src && that.playing == false) {
			that.play();
		} else if (that.elem.src) {
			that.pause();
		}
	}

	//direction: 1 means next, 0 means previous
	this.changeSong = function(direction, playlist) {
		var id = player.findSong(player.id, playlist);
		$('#'+ player.id).removeClass('activeC-low');

		if (direction == 1) {
			if (id < playlist.length - 1) {
				player.playing++;
			} else {
				player.playing = 0;
			}
		} else {
			if (id != 0) {
				player.playing--;
			} else {
				player.playing = playlist.length - 1;
			}
		}
		
		id = player.playing;
		var elem = $('#'+ playlist[id]);
		elem.addClass('activeC-low');

		player.ChangeElemSong(elem);

		//Cleaning lines' angles
		for (var c = 0; c < that.arcs; c++){
			lines[c] = lines[c] - 2*pi * Math.floor(lines[c] / (2*pi));
		}
	}

	//Fires when a song is over
	this.elem.onended = function() { songEnd(); }
	//Fires when audio data is unavailable
	this.elem.onstalled = function() {
		player.nextSong();
	}
	//Fires when the audio data is being downloaded
	that.elem.onprogress = function() {
		if (that.elem.readyState == 4) {
			that.loaded = that.elem.buffered.end(that.elem.buffered.length - 1);
		}
	}

	//Visualization stuff
	jsNode.onaudioprocess = function() {
    var array =  new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);

    if (that.playing) {
    	canvas.clearRect(0, 0, w, h);
    	drawSpectrum(array);
    }
	}

	
	//Draws audio visualization
	function drawSpectrum(array) {
	  var mh = Math.round(h/2);
	  var mw = Math.round(w/2);
	  var a = 0;
    var l = lines.length;
		for (var c = 0; c < l; c++){
			canvas.beginPath();
			canvas.arc(mw, mh, (c+1) * r/l, lines[c], lines[c] + pi/3);
			canvas.stroke();

			lines[c] += (array[c] / 256) * pi/6;
		}

    for (var c = 0; c < n; c++){
    	var val = Math.round(h * (array[c] / 256) / 4);
    	var cos = Math.cos(a);
    	var sin = Math.sin(a);
	    
	    canvas.beginPath();
	    canvas.moveTo(mw + cos*r, mh + sin*r);
	    canvas.lineTo(mw + cos*r + cos*val, mh + sin*r + sin*val);
	    canvas.stroke();

	    a += 2 * pi/n;
    }
	}

	function songEnd() {
		if (player.repeat) {
			that.play();
		} else {
			if (player.shuffle) {
				that.changeSong(1, player.shuffleList);
			} else {
				that.changeSong(1, player.list);
			}
		}
	}
}

module.exports = audio;