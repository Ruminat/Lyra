function interface(win, data) {
	win.setMinimumSize(228, 70);
	win.removeAllListeners();

	/*
	You need to fix it
	win.on('blur', function() { data.focus = false; });
	win.on('focus', function() { data.focus = true; });
	*/

	win.on('close', function() { 
		win.removeAllListeners();
		app.quit();
	});

	$('#resize-window').click(function() {
		if ( win.isMaximized() ) win.unmaximize();
		else win.maximize();
	});
	$('#minimize-window').click(function() { win.minimize(); });
	$('#close-Lyra').click(function()      { app.quit(); 		 });

	$('window').on('online', function()    { data.connection = true;  });
	$('window').on('offline', function()   { data.connection = false; });

	$('.error .button').click(function()   { $('.error').css('display', 'none'); });	

	$(document).keydown(function(e) {
		if (e.keyCode == 116) {
			win.removeAllListeners();
			document.location.reload();
		} else if (e.ctrlKey && e.shiftKey && e.keyCode == 73) {
			win.openDevTools();
		}
	});
}

module.exports = interface;