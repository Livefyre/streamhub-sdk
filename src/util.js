define(['streamhub-sdk/jquery'], function ($) {

    /** 
     * A module containing utility methods.
     * @module streamhub-sdk/util
     */
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
     * Format a date object to be displayed to humans
     * @param date {Date} A JavaScript Date object
     * @return {string} A formatted timestamp like "5/27//06 • 3:26 AM"
     */
    var MONTH_STRINGS = [
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun','Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'];

    exports.formatDate = function (date, relativeTo) {
        relativeTo = relativeTo || new Date();
        var diffMs = date.getTime() - relativeTo.getTime();
        // Future
        if (diffMs > 0) {
            return '';
        }
        // Less than 60s ago -> 5s
        if (diffMs > -60 * 1000) {
            return Math.round( -1 * diffMs / 1000) + 's';
        }
        // Less than 1h ago -> 5m
        if (diffMs > -60 * 60 * 1000) {
            return Math.round( -1 * diffMs / (1000 * 60)) + 'm';
        }
        // Less than 24h ago -> 5h
        if (diffMs > -60 * 60 * 24 * 1000) {
            return Math.round( -1 * diffMs / (1000 * 60 * 60)) + 'h';
        }
        // >= 24h ago -> 6 Jul
        dateString = date.getDate() + ' ' + MONTH_STRINGS[date.getMonth()];
        // or like 6 Jul 2012 if the year if its different than the relativeTo year
        if (date.getFullYear() !== relativeTo.getFullYear()) {
            dateString += ' ' + date.getFullYear();
        }
        return dateString;
    };

    Object.keys = Object.keys || (function () {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !{toString:null}.propertyIsEnumerable("toString"),
            DontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            DontEnumsLength = DontEnums.length;

        return function (o) {
            if (typeof o != "object" && typeof o != "function" || o === null)
                throw new TypeError("Object.keys called on a non-object");

            var result = [];
            for (var name in o) {
                if (hasOwnProperty.call(o, name))
                    result.push(name);
            }

            if (hasDontEnumBug) {
                for (var i = 0; i < DontEnumsLength; i++) {
                    if (hasOwnProperty.call(o, DontEnums[i]))
                        result.push(DontEnums[i]);
                }
            }

            return result;
        };
    })();

    Array.prototype.indexOf = Array.prototype.indexOf || function(val) {
        return $.inArray(val, this);
    };

    return exports;
});
