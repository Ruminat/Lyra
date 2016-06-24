function Checkers() {
	this.radio = function(parent) {
		$(parent).on('click', '.item', function() {
			$(parent + ' .item').removeClass('checked');
			$(this).addClass('checked');
		});
	}
	this.checks = function(elements) {
		elements.forEach(function(item, i, arr) {
			if (typeof item != 'object') {
				listener(item);
			} else {
				listener(item[0], item[1]);
			}
		});

		function listener(item, cb) {
			$(item).parent().click(function() {
				$(this).toggleClass('checked');
				if (isSet(cb)) cb();
			});
		}
	}
}

module.exports = Checkers;