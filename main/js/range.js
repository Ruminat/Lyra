function range(dynamic, mouse, rangeID, lineID, upFunc, move) {
	var $range    = $('#'+ rangeID);
	var $line     = $('#'+ lineID);
	var range     = document.getElementById(rangeID);
	var edgeLeft  = range.getBoundingClientRect().left;
	var edgeRight = edgeLeft + range.getBoundingClientRect().width;
	
	if (isSet(upFunc)) {
		$range.mouseup(function() {
			upFunc();
		});
	}
	
	$range.mousedown(function(e) {

		mouse.move = function(e) {
			if (e.pageX > edgeRight) {
				$line.css('width', '100%');

			} else if (e.pageX < edgeLeft) {
				$line.css('width', '0');

			} else {
				$line.css('width', (e.pageX - edgeLeft) +'px');
			}

			if (dynamic && isSet(upFunc)) upFunc();
			if (isSet(move)) move();
		}

		mouse.move(e);
	});
}

module.exports = range;