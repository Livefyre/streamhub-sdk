define(['streamhub-sdk/debug', 'streamhub-sdk/jquery'], function (debug, $) {
    'use strict';

    var log = debug('util');

    /** 
     * A module containing utility methods.
     * @module streamhub-sdk/util
     */
    var exports = {};

    /**
     * Get outerWidth (jquery-style) of element
     * @deprecated
     */
    exports.outerWidth = function(el) {
        log('Deprecated: util.outerWidth');
        return $(el).outerWidth(true);
    };

    /**
     * Get outerHeight (jquery-style) of element
     * @deprecated
     */
    exports.outerHeight = function(el) {
        log('Deprecated: util.outerHeight');
        return $(el).outerHeight(true);
    };

    /**
     * Get innerWidth (jquery-style) of element
     * @deprecated
     */
    exports.innerWidth = function(el) {
        log('Deprecated: util.innerWidth');
        return $(el).innerWidth();
    };

    /**
     * Get innerHeight (jquery-style) of element
     * @deprecated
     */
    exports.innerHeight = function(el) {
        log('Deprecated: util.innerHeight');
        return $(el).innerHeight();
    };

    /**
     * Format a date object to be displayed to humans
     * @param date {Date} A JavaScript Date object
     * @return {string} A formatted timestamp like "5/27//06 • 3:26 AM"
     */
    var MONTH_STRINGS = [
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun','Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'
    ];

    exports.formatDate = function (date, relativeTo) {
        relativeTo = relativeTo || new Date();
        var diffMs = date.getTime() - relativeTo.getTime(),
            dateString;
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
            if (typeof o !== "object" && typeof o !== "function" || o === null) {
                throw new TypeError("Object.keys called on a non-object");
            }

            var result = [];
            for (var name in o) {
                if (hasOwnProperty.call(o, name)) {
                    result.push(name);
                }
            }

            if (hasDontEnumBug) {
                for (var i = 0; i < DontEnumsLength; i++) {
                    if (hasOwnProperty.call(o, DontEnums[i])) {
                        result.push(DontEnums[i]);
                    }
                }
            }

            return result;
        };
    })();

    Array.prototype.indexOf = Array.prototype.indexOf || function(val) {
        return $.inArray(val, this);
    };
    
    
    var scriptCallbacks = {};
    /**
     * Loads a script and calls the callback.
     * @param src {!string} Source for the script tag.
     * @param callback {!function(Object, Object)} function(err, data)
     * @param [doc] {Element} Document element to use.
     */
    exports.loadScript = function (src, callback, doc) {
        if (scriptCallbacks[src] === true) {
        //Loaded
            callback();
            return;
        }
        
        if (scriptCallbacks[src]) {
        //Loading
            scriptCallbacks[src].push(callback);
            return;
        }
        
        doc = doc || document;
        var head = $(doc).find('head')[0];
        var script = doc.createElement('script');
        
        script.type = 'text/javascript';
        script.src = src;
        script.async = true;
        script.defer = true;
        
        attachCallback(script, callback);
        head.appendChild(script);
        
        function attachCallback(script, callback) {
            scriptCallbacks[script.src] = [callback];

            script.onerror = script.onload = script.onreadystatechange = function(ev) {
                if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                    if (ev.type === 'error') {
                        var err = ev;
                    } else {
                        var data = ev;
                    }
                    executeCallbacks(script.src, err, data);
                    
                    // IE memory leaks
                    script = script.onload = script.onreadystatechange = null;
                }
            };
        };
        
        function executeCallbacks(src, err, data) {
            var callbacks = scriptCallbacks[src];
            for (var i=0, l=callbacks.length; i<l; i++) {
                callbacks[i](err, data);
            }
            scriptCallbacks[src] = true;
        };
    };
    

    return exports;
});
