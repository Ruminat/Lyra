function Checkers() {
	this.radio = function(parent) {
		$(parent).on('click', '.item', function() {
			$(parent + ' .item').removeClass('checked');
			$(this).addClass('checked');
		});
	}
	this.checks = function(elements) {
		elements.forEach(function(item, i, arr) {
			$(item).parent().click(function() {
				$(this).toggleClass('checked');
			});
		});
	}
}

module.exports = Checkers;