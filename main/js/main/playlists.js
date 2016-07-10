function playlists(data) {
	var that = this;
	this.particular = '';
	$('#add-playlist').click(function() {
		data.playlists.num++;
		var id = 'playlist-'+ data.playlists.num;

		$(this).before('<div class="playlist" id="'+ id +'"><input type="text" placeholder="Название"></div>');
		
		id = '#' + id;
		var input = id + ' input';
		inputEvent(input, id, addPlaylist);

		mainUI.focus(input);
	});

	$('.playlists').on('click', '.playlist', function() {
		var id = $(this)[0].id;
		if (id != 'add-playlist' && id != 'my-audio') {
			$('#srch-total-found').text('');
			that.startLoad('with-songs');
			var num = parseInt(id.substr(9, id.length));
			that.turnPlaylist(id);
			storage.read(data.files.playlists, function(obj) {
				var playlist = obj.lists[num];
				var model = '';
				var album = playlist.albumVK;

				player.emptySongs();

				playlist.list.forEach(function(item, i, arr) {
					var options = {delete: true};
					model += player.songHtml(item.type, item.id, item.url, item.title, item.artist, item.duration, '', options);
					player.add(item.type +'-'+ item.id);
				});

				var list = [];
				playlist.folders.list.forEach(function(item, i, arr) {
					localMusic.playlist = num;
					localMusic.foldersCheck = true;
					localMusic.checkFolder(item.dir);
				});

				if (album != '') {
					vk.request('audio.get', 'album_id='+ album, function(res) {
						if (isSet(res)) {
							model += vk.addSongs(res.response.items);
						}
						applyModel(model);
						that.stopLoad('with-songs');
					});

				} else { 
					applyModel(model);
					that.stopLoad('with-songs');
				}
				songsScroll.scroll(0);
			});
		} else if (id == 'my-audio') {
			that.turnPlaylist(id);
			$('#srch-total-found').text('');
			vk.getAudio();
			data.state = 'vk';
			songsScroll.scroll(0);
		}
	});
	$('.playlists').on('contextmenu', '.playlist', function(e) {
		var id = $(this)[0].id;
		var elem = $('#'+ id);
		if (id != 'add-playlist' && id != 'my-audio') {
			var srch = data.state == 'search';
			var sections = [];
			sections.push(['edit',    'Редактировать']);
			mainUI.inActive(!srch, sections, 'add',     'Добавить музыку');
			mainUI.inActive(!srch, sections, 'current', 'Добавить текущую музыку');
			sections.push(['folder',  'Прикрепить папку']);
			sections.push(['delete',  'Удалить альбом']);
			/*for (var c = 0; c < sections.length; c++){
				html += '<div class="'+ sections[c][0] +'"><div>'+ sections[c][1] +'</div></div>';
			}
			ctxMenu.html(html);*/

			mainUI.setUpMenu(e, sections, function() {
				var m = '.context-menu';
				$(m + ' .edit').click(function() {
					var txt = elem.text();
					elem.html('<input type="text">');
					$('#'+ id + ' input').val(txt);
					inputEvent('#'+ id + ' input', '#'+ id, editPlaylist);

					mainUI.focus('#'+ id + ' input');
				});
				$(m + ' .add').click(function()     { addParticular(id);  });
				$(m + ' .current').click(function() { addCurrent(id);     });
				$(m + ' .folder').click(function()  { stickFolder(id);    });
				$(m + ' .delete').click(function()  { deletePlaylist(id); });
			});
		}
	});

	this.sortSongInfo = function(elem, list, IDs) {
		var info = player.getSongData(elem);
		var id = info.id.substr(3, info.id.length);
		if (info.type == 'pc') {
			list.push({
				id:       id,
				url:      info.url,
				type:     info.type,
				title:    info.title,
				artist:   info.artist, 
				duration: info.duration
			});
		} else {
			var l = IDs.length - 1;
			if (IDs[l].length < 100) {
				IDs[l].push(info.id.substr(3, info.id.length));
			} else {
				IDs.push([info.id.substr(3, info.id.length)]);
			}
		}
	}
	this.addSongs = function(songs, playlist, vkSongs) {
		that.startLoad();
		var id = parseInt(playlist.substr(9, playlist.length));
		storage.read(data.files.playlists, function(obj) {
			var playlist = obj.lists[id];
			var album = playlist.albumVK;
			songs.forEach(function(item, i, arr) {
				obj.lists[id].list.push(item);
			});

			if (vkSongs[0].length != 0) {
				if (album != '') {
					pushAlbum(album, obj);
				} else {
					vk.request('audio.addAlbum', 'title='+ playlist.name, function(res) {
						if (isSet(res)) {
							album = res.response.album_id;
							obj.lists[id].albumVK = album;
						}
						pushAlbum(album, obj);
					});
				}
			} else {
				pushAlbum(album, obj);
			}
		});

		function pushAlbum(album, obj) {
			if (vkSongs[0].length != 0 && album != '') {
				var c = 0;
				send(c);
				obj.lists[id].owner = data.vk.id;
			} else { that.stopLoad(); }
			writeToPlaylists(obj); 

			function send(c) {
				var songs = vkSongs[c].join(',');
				vk.request('audio.add', 'album_id='+ album +'&audio_ids='+ songs);
				if (c < (vkSongs.length - 1)) {
					setTimeout(function() { send(c + 1); }, 2000);
				} else {
					that.stopLoad();
				}
			}
		}
	}
	this.startLoad = function(withSongs) {
		data.playlists.state = 'loading';
		if (isSet(withSongs)) mainUI.ui.songs.state = 'loading';
		$('.playlists .waiting').addClass('on');
	}
	this.stopLoad = function(withSongs) {
		data.playlists.state = 'idle';
		if (isSet(withSongs)) mainUI.ui.songs.state = 'idle';
		$('.playlists .waiting').removeClass('on');
		mainUI.makeSongsVisiable();
	}
	this.turnPlaylist = function(id) {
		$('.playlist').removeClass('activeC');
		if (isSet(id)) {
			$(`#${id}`).addClass('activeC');
		}
	}

	function inputEvent(elem, id, act) {
		$(elem).blur(function() {
			check();
		});
		$(elem).keydown(function(e) {
			//enter || esc
			if (e.keyCode == 13 || e.keyCode == 27) {
				check();
			}
		});

		function check() {
			if ($(elem).val() != '') { 
				act(id, elem); 
			} else {
				$(elem).parent().remove();
			}
		}
	}

	function addPlaylist(id, input) {
		var val = $(input).val();

		if (val != '') {
			$(id).html('');
			$(id).text(val);

			var id = parseInt(id.substr(10, id.length));
			pushList(val, id);
		} else {
			$(id).remove();
		}
	}
	function deletePlaylist(id) {
		$('#'+ id).remove();
		storage.read(data.files.playlists, function(obj) {
			var num = parseInt(id.substr(9, id.length));

	    if (obj.lists[num].albumVK != '') {
	    	vk.request('audio.deleteAlbum', 'album_id='+ obj.lists[num].albumVK);
	    }
	    
			for (var c = num; c < obj.lists.length - 1; c++){
				obj.lists[c + 1].id--;

				var elemID = $('#playlist-'+ (c + 1) )[0].id;
				var ID = parseInt(elemID.substr(9, elemID.length)) - 1;
				$('#'+ elemID)[0].id = 'playlist-'+ ID;

				var t = obj.lists[c];
				obj.lists[c] = obj.lists[c + 1];
				obj.lists[c + 1] = t;
			}
			obj.lists.length--;
			data.playlists.num--;

			writeToPlaylists(obj); 
		});
	}

	function editPlaylist(id, input) {
		var val = $(input).val();

		$(id).html('');
		$(id).text(val);

		storage.read(data.files.playlists, function(obj) {
			var num = parseInt(id.substr(10, id.length));
			obj.lists[num].name = val;

			writeToPlaylists(obj); 
		});
	}

	function pushList(name, id) {
  	storage.read(data.files.playlists, function(obj) {
			obj.lists.push({
				name: name,
				id: id,
				albumVK: '',
				owner: '',
				folders: {
					list: [],
					songs: []
				},
				list: []
			});

			writeToPlaylists(obj); 
		});
	}

	function addCurrent(playlist) {
		var songs = $('#songs-wrap')[0].children;
		var list = [], IDs = [[]];

		for (var c = 0; c < songs.length; c++){
			var id = songs[c].id;
			that.sortSongInfo($('#'+ id)[0], list, IDs);
		}
		that.addSongs(list, playlist, IDs);
	}
	function addParticular(playlist) {
		$('.song').addClass('pick');
		$('.addSongs').css('display', 'flex');
		that.particular = playlist;
	}

	function stickFolder(id) {
		mainUI.callWin();
		var title = $('#'+ id)[0].innerText;
		var html  = '<h4>Прикрепление папок к альбому '+ title +'</h4>';

		storage.read(data.files.playlists, function(obj) {
			var num     = parseInt(id.substr(9, id.length));
			var folders = obj.lists[num].folders;
			var lastID  = folders.length;
			var field   = '<p>Бросьте вашу(и) папку(и) в это поле</p>';

			folders.list.forEach(function(item, i, arr) {
				html += '<div class="button usual" id="folder-'+ i +'">'+ item.name +' - '+ item.dir +'</div>';
			});
			html += '<div class="field" id="folders-field">'+ field +'</div>';
			html += '<div class="button green-BG" id="folders-save">Сохранить</div>';
			html += '<div class="button red-BG" id="folders-cancel">Отмена</div>';

			$('#win-wrap').html(html);

			$('.button.usual').contextmenu(function(e) {
				var elem   = $(this);
				var thisID = elem[0].attributes.id.nodeValue;
				thisID     = thisID.substr(7, thisID.length);
				ctxMenu.html('<div class="delete">Открепить папку</div>');
				mainUI.callMenu(e);
				$('.context-menu .delete').click(function() {
					elem.remove();
					for (var c = thisID; c < folders.length - 1; c++) {
						folders[c] = folders[c + 1];
					}
					folders.length--; lastID--;
				});
			});
			$('#folders-save').click(function() {
				obj.lists[num].folders = folders;
				writeToPlaylists(obj);
				mainUI.hideWin();
			});

			var $field = $('#folders-field');
			field = document.getElementById('folders-field');

			field.ondragleave = function() { $field.css('outline-color', '#bbb');    };
			field.ondragover = function()  { $field.css('outline-color', '#FB8476'); };
			field.ondrop = function(e) {
				$field.css('outline-color', '#bbb');
				var files = e.dataTransfer.files;
				[].forEach.call(files, function(item, i, arr) {
					var dir = dirToRight(item.path);
					fs.stat(dir, function(err, stats) {
						if (stats.isDirectory()) addDir(dir, item.name);
					});
				});
			};

			function addDir(dir, name) {
				$field.before('<div class="button usual" id="folder-'+ id +'">'+ name +' - '+ dir +'</div>');
				folders.list.push({name: name, dir: dir});
				lastID++;
			}
		});
	}

	function applyModel(model) {
		$('#songs-wrap').append(model);
		player.stats.call();
		data.state = 'playlist';
	}

	this.initialize = function() {
		storage.read(data.files.playlists, function(obj) {
			if (isSet(data.vk)) {
				$('#add-playlist').before('<div class="playlist" id="my-audio">Мои Аудиозаписи</div>');
				that.turnPlaylist('my-audio');
			}
			data.playlists.list = obj.lists;

			for (var c = 0; c < obj.lists.length; c++){
				data.playlists.num++;
				var owner = obj.lists[c].owner;

				if (owner == '' || (isSet(data.vk) && owner == data.vk.id)) {
					var id = data.playlists.num;
					var name = obj.lists[c].name;
					$('#add-playlist').before('<div class="playlist" id="playlist-'+ id +'">'+ name +'</div>');
				}
			}
		});
	}
	function writeToPlaylists(obj) {
		storage.write(data.files.playlists, JSON.stringify(obj, null, ' '));
	}

	synchronize('playlists');
}

module.exports = playlists;