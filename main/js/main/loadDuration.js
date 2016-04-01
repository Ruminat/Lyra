function LoadDuration() {
	var dir = 'E:/Vlad/Music/';
	var audios = [];
	var n = 3;
	for (var c = 0; c < n; c++){
		$('.audios').append('<audio id="audio-'+ c +'"></audio>');
		audios[c] = (document.getElementById('audio-'+ c));
		audios[c].counter = c;
		audios[c].start = c;
	}

	fs.readdir(dir, function(err, files) {
		var model = '';

		files.forEach(function(item, i, arr) {
			model += player.songHtml('pc', i, dir+item, item, '', '');
		});

		$('#songs-wrap').prepend(model);

		$('.empty').remove();

		var children = $('#songs-wrap')[0].children;
		audios.forEach(function(item, i, arr) {
			item.onloadedmetadata = function() {
				console.log();
				$('#'+ children[item.counter].id +' .duration').text(parseSec(item.duration));
				item.counter++;
				if (item.counter < children.length) {
					item.src = children[item.counter].attributes.url.nodeValue;
				} else {
					item.counter = item.start;
				}
			}

			item.src = children[item.counter].attributes.url.nodeValue;
			// console.log(item);
		});
	});
}

module.exports = LoadDuration;