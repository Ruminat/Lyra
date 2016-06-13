function Settings() {
	var that     = this;
	this.opened  = false;
	var elements = {
		checks: new checkers.checks([
				'#S-status', 
				'#S-tips', 
				'#S-visualization',
				'#S-cacheSongs'
			])
	};

	/*storage.write(data.files.settings, JSON.stringify(s), () => {
		console.log('Done');
	});*/
	
	$('#main-settings').click(()  => {
		if (that.opened) {
			cancel();
		} else {
			$('.settings').css('display', 'block');
			mainUI.checkScrolls();
			that.opened = true;
		}
		

		// vk.request('audio.setBroadcast', `audio=${data.vk.id}_431501009`); - example of changing status to and audio one
		if (isSet(data.vk)) {
			//VK profile
			var parameters = `user_ids=${data.vk.id}&fields=first_name,last_name,photo_100,status`;
			vk.request('users.get', parameters, (res) => {
				if (isSet(res)) {
					var r = res.response[0];

					if (isSet(r.photo_100))
						$('#vk-photo').css('background-image', `url('${r.photo_100}')`);
					if (isSet(r.first_name) && isSet(r.last_name))
						$('#vk-name').text(`${r.first_name} ${r.last_name}`);
					if (isSet(r.status_audio)){
						$('#vk-status').text(`${r.status_audio.artist} - ${r.status_audio.title}`);
					} else if (isSet(r.status)){
						$('#vk-status').text(r.status);
					}
				}
			});
		} else {
			$('#S-vk-wrap').css('display', 'none');
		}
	 });

	$('#close-settings, #S-cancel').click(() => { cancel();    });
	$('#S-quit').click(() 									 => { vk.logout(); });

	choosePath('#downloads-path', '#downloads-path-in');
	choosePath('#cache-path',     '#cahce-path-in');

	function cancel() {
		$('.settings').css('display', 'none');
		that.opened = false;
	}
	function choosePath(icon, input) {
		$(icon).click(function() {
			var folder = openDialog();
			if (folder != '') {
				$(input).val(folder);
			}
		});
	}
	function openDialog(props) {
		var result;
		if (isSet(props)) {
			if (props.right == false) {
				result = dialog.showOpenDialog({properties: ['openDirectory']}) || [''];
			}
		} else {
			result = dialog.showOpenDialog({properties: ['openDirectory']}) || [''];
			if (result[0] != '') {
				result = [dirToRight(result[0])];
			}
		}
		return result[0];
	}
}


module.exports = Settings;