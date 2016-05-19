function Groups() {
	$('#menu-groups').click(function() {
		var url = vk.APImethod('groups.get', `user_id=${data.vk.id}&extended=1&fields=members_count&`);
		$.get(url, function(res) {
			if (isSet(res.response)) {
				mainUI.callWin();
				var html   = '<h4>Сообщества</h4>';
				// console.log(res.response.items);

				res.response.items.forEach(function(item, i, arr) {
					var photo  = item.photo_200 || item.photo_100 || item.photo_50;

					html += 
					`\n<div class="group" id="group-${item.id}" url="${item.screen_name}">`
						+`<div class="image" style="background-image: url('${photo}')"></div>`
						+`<div class="info">`
							+`<h5 class="title">${item.name}</h5>`
							+`<p class="members">${formatNumber(item.members_count)} участников</p>`
						+`</div>`
					+`</div>`;
				});

				mainUI.applyWin(html);
			} else {
				cryingOutForError('Повторите попытку через некоторое время.');
			}
		});
	});
	$('.win').on('click', '.group', function() {
		var url = $(this)[0].attributes.url.nodeValue;
		vk.request('wall.get', `domain=${url}&count=25`, function(res) {
			console.log(res);
		});
	});
}

module.exports = Groups;