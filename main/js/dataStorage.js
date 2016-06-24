function storage() {
	var that  = this;
	data.root = dirToRight(app.getPath('userData'));

	var dt = data.root + 'data/';
	data.folder = dt;

	data.files = {
		playlists: dt + 'playlists.json',
		settings:  dt + 'settings.json',
		saved:     dt + 'saved.json'
	};
	data.dirs = {
		songs:     dt + 'songs'
	};

	findData();

	this.write = function(where, what, cb) {
		fs.writeFile(where, what, function(err, res) {
			if (err) throw err;
			if (isSet(cb)) cb();
		});
	}
	this.read = function(what, cb) {
		fs.readFile(what, function(err, res) {
			if (err) throw err;
			var str = res.toString();
			var obj = {};

			if (str != '') {
				obj = JSON.parse(str);
				data.playlists.JSON = obj;
			} else {
				obj.lists = [];
			}
			
			cb(obj);
		});
	}

	this.readData = function() {
		fs.readFile(data.files.settings, (err, res) => {
			let sett = JSON.parse(res.toString());
			if (isSet(sett.status)) s = sett;
			else that.write(data.files.settings, JSON.stringify(s));
		});
		fs.readFile(data.files.saved,    (err, res) => {
			saved = JSON.parse(res.toString());
			synchronize('storage');
		});
	}

	this.saved = {};
	this.savedDelay = new delay(250, () => {
		that.write(data.files.saved, JSON.stringify(that.saved));
	});
	this.changeSaved = function(change) {
		change();
		that.savedDelay.call();
	}

	function findData() {
		fs.readdir(data.root, function(err, files) {
			if (err) throw err;
			
			for (var c = 0; c < files.length; c++){
				if (files[c] == 'data') {
					initiateData();
					return false;
				}
			}

			fs.mkdir(data.root + 'data/', function(err) {
				if (err) throw err;
				initiateData();
			});
		});
	}

	function initiateData() {
		for (dir in data.dirs) {
			try {
				fs.statSync(data.dirs[dir]);
			} catch (err) {
				mkDir(data.dirs[dir]);
			}
		}

		for (file in data.files) {
			// fs.appendFileSync(data.files[file], '');
			try {
				fs.statSync(data.files[file]);
			} catch (err) {
				fs.appendFileSync(data.files[file], '{}');
			}
		}

		that.readData();
	}

	function mkDir(dir) {
		fs.mkdir(dir, function(err) {
			if (err) throw err;
		});
	}
}

module.exports = storage;