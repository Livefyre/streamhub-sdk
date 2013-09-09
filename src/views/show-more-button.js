define(['inherits', 'streamhub-sdk/view'],
function (inherits, View) {

	function ShowMoreButton (opts) {
		View.call(this, opts);
		opts = opts || {};
		if (opts.more) {
			this.setMoreStream(opts.more);
		}
	}
	inherits(ShowMoreButton, View);

	ShowMoreButton.prototype.template = function () {
		return "Load More";
	};

	ShowMoreButton.prototype.setElement = function () {
		var self = this;
		View.prototype.setElement.apply(this, arguments);
		// Hide the button on click. When more content is held and can be shown,
		// It will reappear
		this.$el.on('click', function () {
			self.$el.hide();
			self.$el.trigger('showMore.hub');
		});
	};

	ShowMoreButton.prototype.setMoreStream = function (more) {
		var self = this;

		this._more = more;

		// When more content is held to be shown, show the button
		this._more.on('hold', function () {
			self.$el.show();
		});		
	};

	ShowMoreButton.prototype.getMoreStream = function () {
		return this._more;
	};

	return ShowMoreButton;
});