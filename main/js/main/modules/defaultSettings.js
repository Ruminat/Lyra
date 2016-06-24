function DefaultSettings() {
	return {
		status: false,
		tips: true,
		vs: { //vs is basically audio visualizer
			on: true
		},
		downloads: {
			path: ''
		},
		cache: {
			on: false,
			path: ''
		}
	}
}

module.exports = DefaultSettings;