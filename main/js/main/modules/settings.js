function Settings() {
	var that          = this;
	var savedS        = {};
	var isInitialized = false;
	this.opened       = false;

	this.initialize = () => {
		Object.assign(savedS, s);
		loadChecks();
		loadInputs();

		isInitialized = true;
	}

	function loadChecks() {
		var checks = $('.settings .check');
		for (var c = 0, l = checks.length; c < l; c++) {
			var info   = getInfo(checks[c]);
			var parent = $('#'+ info.id).parent();
			let o      = objProps(savedS, info.props);
			if (!isInitialized) {
				checkers.checks([
					['#'+ info.id, () => {
						o.obj[o.prop] = !o.obj[o.prop];
					}]
				]);
			}

			if (o.obj[o.prop]) parent.addClass('checked');
			else parent.removeClass('checked');
		}
	}
	function loadInputs() {
		var inputs = $('.settings input');
		for (var c = 0, l = inputs.length; c < l; c++) {
			var info = getInfo(inputs[c]);
			let o    = objProps(savedS, info.props);
			let elem = $('#'+ info.id);
			elem.val(o.obj[o.prop]);

			if (!isInitialized) {
				elem.on('input', () => { o.obj[o.prop] = elem.val(); });
			}
		}
	}
	function getInfo(elem) {
		return {id: elem.id, props: elem.id.split('_')[1].split('-')};
	}
	
	$('#main-settings').click(() => {
		if (that.opened) {
			cancel();
		} else {
			Object.assign(savedS, s);
			loadChecks();
			loadInputs();
			$('.settings').css('display', 'block');
			mainUI.checkScrolls();
			that.opened = true;
		}
		
		VKstuff();
		
	 });

	$('#close-settings, #S-cancel').click(() => { cancel();    		});
	$('#save-settings').click(						() => { saveSettings(); });
	$('#S-quit').click(									  () => { vk.logout(); 		});

	choosePath('#S-_downloads-path_', '#S-_downloads-path_-in', 'downloads');
	choosePath('#S-_cache-path_',     '#S-_cache-path_-in',     'cache');

	function VKstuff() {
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
	}
	function saveSettings() {
		s = savedS;
		storage.write(data.files.settings, JSON.stringify(s));
		close();
	}
	function cancel() {
		close();
		Object.assign(savedS, s);
	}
	function close() {
		$('.settings').css('display', 'none');
		that.opened = false;
	}
	function choosePath(icon, input, name) {
		$(icon).click(function() {
			var folder = openDialog();
			if (folder != '') {
				$(input).val(folder);
				savedS[name].path = folder;
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

	synchronize('settings');
}

module.exports = Settings;