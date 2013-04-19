/** 
 * A module to render tiled walls of Content
 * @module streamhub-sdk/util
 */
define(['jquery'], function ($) {
    var exports = {};

    /**
     * Extend `this` with a provided prototype to return a Subclass
     */
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

    /**
     * Return the hostname of the correct StreamHub Service to use
     * given client opts. If network is 'livefyre.com', the correct host to request
     * is actually dependent on the environment.
     * @param opts {Object} The same `opts` passed to LivefyreBootstrapClient
     */
    exports.streamhubHostFromOpts = function (opts) {
        var network = opts.network;
        var environment = opts.environment || 'livefyre.com';
        return (network === 'livefyre.com') ? environment : network;
    }
    
    exports.formatDate = function(stamp) {
        return new Date(stamp*1000).toLocaleString().replace(
            /(.*)...(..) (.*):.* (.*)/,
            "$1/$2 &bull; $3 $4"
        );
    };

	return exports;
});
