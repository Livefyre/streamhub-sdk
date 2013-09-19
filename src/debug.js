/*
From: https://github.com/visionmedia/debug

Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
define(function(require, exports, module) {
    'use strict';

    /**
     * Expose `debug()` as the module.
     */

    module.exports = debug;

    /**
     * Create a debugger with the given `name`.
     *
     * @param {String} name
     * @return {Type}
     * @api public
     */

    function debug(name) {
        if (!debug.enabled(name)) {
            return function() {};
        }
        return function(fmt) {
            fmt = coerce(fmt);

            var curr = new Date();
            var ms = curr - (debug[name] || curr);
            debug[name] = curr;

            fmt = name +
                ' ' +
                fmt +
                ' +' + debug.humanize(ms);

            arguments[0] = fmt;

            // This hackery is required for IE8
            // where `console.log` doesn't have 'apply'
            var console = window.console;
            if (console && console.log) {
                Function.prototype.apply.call(console.log, console, arguments);
            }
        };
    }

    /**
     * The currently active debug mode names.
     */

    debug.names = [];
    debug.skips = [];

    /**
     * Enables a debug mode by name. This can include modes
     * separated by a colon and wildcards.
     *
     * @param {String} name
     * @api public
     */

    debug.enable = function(name) {
        try {
            localStorage.debug = name;
        } catch (e) {}

        var split = (name || '').split(/[\s,]+/),
            len = split.length;

        for (var i = 0; i < len; i++) {
            name = split[i].replace('*', '.*?');
            if (name[0] === '-') {
                debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
            } else {
                debug.names.push(new RegExp('^' + name + '$'));
            }
        }
    };

    /**
     * Disable debug output.
     *
     * @api public
     */

    debug.disable = function() {
        debug.enable('');
    };

    /**
     * Humanize the given `ms`.
     *
     * @param {Number} m
     * @return {String}
     * @api private
     */

    debug.humanize = function(ms) {
        var sec = 1000,
            min = 60 * 1000,
            hour = 60 * min;

        if (ms >= hour) {
            return (ms / hour).toFixed(1) + 'h';
        }
        if (ms >= min)  {
            return (ms / min).toFixed(1) + 'm';
        }
        if (ms >= sec) {
            return (ms / sec | 0) + 's';
        }
        return ms + 'ms';
    };

    /**
     * Returns true if the given mode name is enabled, false otherwise.
     *
     * @param {String} name
     * @return {Boolean}
     * @api public
     */

    debug.enabled = function(name) {
        var i, len;
        for (i = 0, len = debug.skips.length; i < len; i++) {
            if (debug.skips[i].test(name)) {
                return false;
            }
        }
        for (i = 0, len = debug.names.length; i < len; i++) {
            if (debug.names[i].test(name)) {
                return true;
            }
        }
        return false;
    };

    /**
     * Coerce `val`.
     */

    function coerce(val) {
        if (val instanceof Error) {
            return val.stack || val.message;
        }
        return val;
    }

    // persist

    if (window.localStorage) {
        debug.enable(localStorage.debug);
    }
});