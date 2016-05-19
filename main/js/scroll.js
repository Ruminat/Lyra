function scroll(parentScrollID, scrollerID, wrapperID, mouse, funcs) {
	if (typeof funcs == 'object') {
		var down = isSet(funcs[0]) ? funcs[0] : function(){};
		var up   = isSet(funcs[1]) ? funcs[1] : function(){};
	} else { down = up = function(){}; }

	var that    = this;
	var $scroll = $('#'+ scrollerID);
	var $parent = $('#'+ parentScrollID);
	var $wrap   = $('#'+ wrapperID);
	var wrap    = document.getElementById(wrapperID);
	var scroll  = document.getElementById(scrollerID);
	mouse.move  = function(){};

	var space = function()  { return wrap.scrollHeight - $wrap.height();   };
	var height = function() { return $parent.height()  - $scroll.height(); };

	$(document).mouseup(function() { up(); });

	$scroll.mousedown(function(e) {
		$('.select').addClass('no-select');
		down();

		mouse.startY = e.pageY;
		scroll.startY = $scroll.position().top;

		mouse.move = function(e) {
			mouse.y = e.pageY;
			var dist = scroll.startY + mouse.y - mouse.startY;

			if (dist < 0) {
				$scroll.css('top', 0 + 'px');
			} else if (dist > height()) {
				$scroll.css('top', height() + 'px');
			} else {
				$scroll.css('top', dist + 'px');
			}

			var percent = (dist / (height() / 100)) / 100;
			$wrap.scrollTop(space() * percent);
		}
	});

	$wrap.scroll(function() {
		var percent = ($wrap.scrollTop() / (space() / 100)) / 100;
		$scroll.css('top', (height() * percent) + 'px');
	});

	this.check = function() {
		var w = $wrapper()[0];
		if (w.scrollHeight > w.clientHeight) {
			$scroll.css('display', 'block');
		} else {
			$scroll.css('display', 'none');
		}
	}

	function $wrapper() { return $('#'+ wrapperID); }
}

module.exports = scroll;