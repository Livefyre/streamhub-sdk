define(['jquery'], function ($) {
    var exports = {};

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

    exports.outerWidth = function(el) {
        return parseInt(el.css('width'), 10) +
            parseInt(el.css('padding-left'), 10) +
            parseInt(el.css('padding-right'), 10) +
            parseInt(el.css('border-left-width'), 10) +
            parseInt(el.css('border-right-width'), 10) +
            parseInt(el.css('margin-left'), 10) +
            parseInt(el.css('margin-right'), 10);
    };

    exports.outerHeight = function(el) {
        return parseInt(el.css('height'), 10) +
            parseInt(el.css('padding-top'), 10) +
            parseInt(el.css('padding-bottom'), 10) +
            parseInt(el.css('border-top-width'), 10) +
            parseInt(el.css('border-bottom-width'), 10) +
            parseInt(el.css('margin-top'), 10) +
            parseInt(el.css('margin-bottom'), 10);
    };
    
    exports.innerWidth = function(el) {
        return parseInt(el.css('width'), 10);
    };

    exports.innerHeight = function(el) {
        return parseInt(el.css('height'), 10);
    };
      
	return exports;
});