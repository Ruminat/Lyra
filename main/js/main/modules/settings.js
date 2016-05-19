function Settings() {
	var elements = {
		checks: new checkers.checks(['#S-status', '#S-tips', '#S-visualization'])
	}
	
	$('#main-settings').click(function() {
		$('.settings').css('display', 'block');
		mainUI.checkScrolls();
	 });
	 $('#close-settings').click(function() {
		$('.settings').css('display', 'none');
	});
}

module.exports = Settings;