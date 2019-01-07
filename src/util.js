define([
    'streamhub-sdk/debug',
    'streamhub-sdk/jquery',
    'streamhub-sdk/util/date',
    'mout/object/get'
], function (debug, $, dateUtil, get) {
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

    exports.formatDate = dateUtil.formatDate;

    /**
     * Binary insert function.
     * Adapted from:
     * http://machinesaredigging.com/2014/04/27/binary-insert-how-to-keep-an-array-sorted-as-you-insert-data-in-it/
     * @param {Object} opts Configuration options.
     */
    exports.binaryInsert = function (opts) {
        function getValue(val) {
            return opts.prop ? get(val, opts.prop) : val;
        }

        var guess;
        var max = opts.array.length - 1;
        var min = 0;
        var val = getValue(opts.value);

        while (min <= max) {
            guess = (min + max) / 2 | 0;

            if (getValue(opts.array[guess]) > val) {
                max = guess - 1;
                continue;
            }
            min = guess + 1;

            if (getValue(opts.array[guess]) === val) {
                break; // replace with return if no duplicates are desired
            }
        }
        opts.array.splice(min, 0, opts.value);
    };

    /**
     * Binary search function.
     * Adapted from:
     * http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
     * @param {Array.<*>} arr - Array of character limits.
     * @param {function()} comparator - Comparison function.
     * @return {*?} Matched item.
     */
    exports.binarySearch = function (arr, comparator) {
        var minIndex = 0;
        var maxIndex = arr.length - 1;
        var currentIndex;
        var currentElement;
        var result;

        while (minIndex <= maxIndex) {
            currentIndex = (minIndex + maxIndex) / 2 | 0;
            currentElement = arr[currentIndex];
            result = comparator(currentElement);

            if (result < 0) {
                minIndex = currentIndex + 1;
            } else if (result > 0) {
                maxIndex = currentIndex - 1;
            } else {
                return currentElement;
            }
        }
        return null;
    };

    /**
    * Simple wrapper for request animation frame or fallback.
    * @type {function}
    */
    exports.raf = (function () {
        if ('requestAnimationFrame' in window) {
            return window.requestAnimationFrame.bind(window);
        }
        return function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();

    exports.objectKeys = Object.keys || (function () {
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
                throw new TypeError("objectKeys called on a non-object");
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

    return exports;
});
