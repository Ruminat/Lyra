function localMusic(ui) {
	$('.main').append('<audio id="duration"></audio>');
	var songs    = document.getElementById('audio-dropArea');
	var lastId   = 0;
	var levels   = 0;
	var dur      = document.getElementById('duration');
	var playlist = [];
	var that     = this;
	this.foldersCheck = false;
	this.playlist     = -1;

	songs.ondrop = function(e) {
		if (ui.songs.state == 'idle') {
			playlists.startLoad('with-songs');
			var files    = e.dataTransfer.files;
			var newFiles = [];
			var path     = dirToRight(files[0].path);
			var dir      = path.split(files[0].name)[0];
			[].forEach.call(files, function(item, i, arr) {
				newFiles.push(item.name);
			});
			checkFiles(dir, newFiles);

			hideArea();
		} else {
			cryingOutForError('Дождитесь обработки аудиозаписей.');
		}
	}
	songs.ondragleave = function() { hideArea(); }
	songs.ondragover = function() { displayArea(); }
	document.ondragover = function() {
		$('#audio-dropArea').css('display', 'block');
		return false; 
	}
	document.ondrop = function(e) {
		e.preventDefault();
		$('#audio-dropArea').css('display', 'none');
		return false;
	}

	function displayArea() {
		if (!ui.songs.painted) {
			$('#audio-dropArea').css('display', 'block');
			$('#audio-dropArea').css('background', 'rgba(255, 255, 255, 0.3)');
			ui.songsPainted = true;
		}
	}
	function hideArea() { $('#audio-dropArea').css('background', 'none'); }

	this.checkFolder = function(dir) {
		levels++;
		dir = dirToRight(dir);
		fs.stat(dir, function(err, stats) {
			if (stats.isDirectory()) {
				fs.readdir(dir, function(err, files) {
					checkFiles(dir, files);
					levelsDown();
				});
			} else {
				levelsDown();
			}
		});
	}
	function checkFiles(dir, files) {
		levels++;
		files.forEach(function(file, i, arr) {
			var ext = path.extname(file);
			if (ext == '.mp3') {
				addSong(dir, file);
			} else if (ext == '') {
				that.checkFolder(dir + file);
			}
		});
		levelsDown();
	}
	function addSong(dir, name) {
		dir = dirToRight(dir);
		var name = name.substr(0, name.length - 4);
		playlist.push({dir: dir, name: name});
	}
	function sortPlaylist() {
		if (levels == 0) {
			sortSongs(playlist);
			pushPlaylist();
		}
	}
	function levelsDown() {
		levels--;
		sortPlaylist();
	}
	function pushPlaylist() {
		if (that.playlist != -1 && that.foldersCheck) {
			storage.read(data.files.playlists, function(obj) {
				push(obj);
			});
		} else {
			push();
		}

		function push(obj) {
			var set = isSet(obj)
			var folders = set ? obj.lists[that.playlist].folders : undefined;
			var model = '';
			var idList = [];
			player.list.reverse();

			playlist.forEach(function(item, i, arr) {
				var title = item.name, artist = '';
				var parts = title.split('-');
				if (parts.length == 2) {
					artist = parts[0];
					title  = parts[1];
				}

				var id  = i + lastId;
				var url = item.dir + item.name + '.mp3';
				var duration = '';

				if (set) {
					folders.songs.forEach(function(item, i, arr) {
						if (url == item.url) {
							duration = item.duration;
						}
					});
					if (duration == '') folders.songs.push({url: url, duration: ''});
				}


				idList.push('pc-'+ id);
				var options = {delete: true};
				model += player.songHtml('pc', id, url, title, artist, duration, '', options);
			});

			for (var c = idList.length - 1; c >= 0; c--){
				player.add(idList[c]);
			}

			lastId += playlist.length;
			player.list.reverse();
			player.playing = player.findSong(player.id);

			$('#songs-wrap').prepend(model);

			player.stats.call();

			if (set) {
				obj.lists[that.playlist].folders = folders;
				storage.write(data.files.playlists, JSON.stringify(obj, null, ' '), function() {
					addDuration();
					player.makeShuffle();
				});
			} else {
				addDuration();
				player.makeShuffle();
			}
		}
	}
	function addDuration() {
		playlists.startLoad();
		if (that.playlist != -1 && that.foldersCheck) {
			storage.read(data.files.playlists, function(obj) {
				add(obj);
			});
		} else {
			add();
		}		

		function add(obj) {
			var set = isSet(obj)
			var folders = set ? obj.lists[that.playlist].folders : undefined;
			var wrap = $('#songs-wrap')[0].children;
			var counter = 0;

			dur.onloadedmetadata = function() {
				var duration = parseSec(dur.duration);
				var src = getSrc(counter);
				p(counter).text(duration);

				if (set) {
					folders.songs.forEach(function(item, i, arr) {
						if (src == item.url) {
							item.duration = duration;
						}
					});
				}
				if (counter < playlist.length - 1) {
					incCounter();
					var src = getSrc(counter);

					dur.src = src;
				} else { 
					playlist.length = 0;
					that.foldersCheck = false;
					if (set) {
						obj.lists[that.playlist].folders = folders;
						storage.write(data.files.playlists, JSON.stringify(obj, null, ' '));
					}
					playlists.stopLoad('with-songs');
				}
			}

			dur.src = getSrc(counter);

			function elem(counter) {
				return $('#'+ wrap[counter].id +' .duration');
			}
			function p(counter) {
				return $('#'+ wrap[counter].id +' .duration p');
			}
			function getSrc(counter) {
				return wrap[counter].attributes.url.nodeValue;
			}
			function incCounter() {
				while (p(counter).text() != '' && counter < playlist.length - 1) { counter++; }
			}
		}
	}
}

module.exports = localMusic;