define(function (require, exports) {
	var $ = require('jquery');

	exports.extend = function (prototypeExtension, staticExtension) {
		var Super = this;
		var Constructor = function () { return Super.apply(this, arguments); };

		// Extenders can specify their own .constructor function
		if (prototypeExtension && prototypeExtension.hasOwnProperty('constructor')) {
			Constructor = prototypeExtension.constructor;
		}

		// Extensions get any static properties of the Super, and
		// any they specify manually
		$.extend(Constructor, Super, staticExtension);

		// Set Constructor.prototype chain to get to Super
		var Extension = function () { this.constructor = Constructor; };
		Extension.prototype = Super.prototype;
		Constructor.prototype = new Extension();

		// Extend the new Constructor's prototype with the prototypeExtension
		if (prototypeExtension) { $.extend(Constructor.prototype, prototypeExtension); }

		Constructor.__super__ = Super.prototype;

		return Constructor;
	};

	return exports;
})