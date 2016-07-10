function EndlessScroll() {
	var that   = this;
	this.pos   =    0;
	this.count =  100;

	this.addSongs = (method, params, state) => {
		vk.request(method, params, (res) => {
			if (isSet(res)) {
				player.emptySongs();
				that.pos    = 0;
				that.params = params;
				that.method = method;
				var model   = vk.addSongs(vk.resItems(res));

				$('.songs .wrapper').html(model);
		    player.makeShuffle();
		    player.stats.call();

		    if (state == 'search') {
		    	$('#srch-total-found').text('Всего найдено: '+ formatNumber(res.response.count));
		    }

		    data.state = state;
		    playlists.turnPlaylist();
		    songsScroll.scroll(0);
		    mainUI.makeSongsVisiable();
			}
		});
	}

	$('#songs-wrap').scroll(function() {
		if (
				data.state == 'search' || data.state == 'popular' || 
			  data.state == 'recommendations'
			) {
			var elem   = document.getElementById('songs-wrap');
			var h      = elem.scrollHeight - $(this).height();
			var scroll = $(this).scrollTop();

			if (h == scroll) {
				es.pos     = player.list.length;
				var params = es.params + `&offset=${es.pos}`;

				vk.request(es.method, params, (res) => {
					if (isSet(res)) {
						var model = vk.addSongs(vk.resItems(res));

						$('.songs .wrapper').append(model);
				    player.makeShuffle();
				    player.stats.call();

				    $('#songs-wrap').scrollTop($('#songs-wrap').scrollTop() + 1);
					}
				});
			}
		}
	});
}

module.exports = EndlessScroll;