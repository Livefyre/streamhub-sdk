var merge = require('mout/object/merge');
var mixIn = require('mout/object/mixIn');

'use strict';

/**
 * Configuration service.
 * Allows setting/getting of config values throughout the SDK without having to
 * hardcode values in any deep locations. Ideally this would be set from the
 * apps themselves in order to keep from having to update the SDK whenever a
 * value changes.
 * @constructor
 */
function ConfigSvc() {
    /**
     * Internal config object.
     * @type {Object}
     * @private
     */
    this._config = merge({}, ConfigSvc.DEFAULTS);

    /**
     * Determines if the current page is secure. If passed in the `opts`
     * argument, use it, otherwise, check the window's location.
     * @type {boolean}
     */
    this._config.isSecure = window.location.protocol === 'https:';
};

/**
 * Default config values.
 * @type {Object}
 */
ConfigSvc.DEFAULTS = {
    secureFpUrl: 'https://d2kmm3vx031a1h.cloudfront.net'
};

/**
 * Get a specific key from the config object.
 * @param {string} key - Key to retrieve config value for.
 * @param {*} opt_defaultValue - Default value to return if not set.
 * @return {*}
 */
ConfigSvc.prototype.get = function (key, opt_defaultValue) {
    return this._config[key] || opt_defaultValue;
};

/**
 * Sets a config value.
 * @param {string|Object.<string, *>} key - Key to set config value on.
 * @param {*} value - Config value.
 */
ConfigSvc.prototype.set = function (key, value) {
    // The key is a string, so that means `key` can be used as the key and
    // `value` can be used as a string value.
    if (typeof(key) === 'string') {
        this._config[key] = value;

    // The key is an object, so that means it contains any number of key/value
    // pairs and we can just mix the 2 objects together. This also means that
    // the options object is now in the `value` argument position.
    } else if (typeof(key) === 'object') {
        mixIn(this._config, key);

    // All supported types have been checked, so now there is nothing to do.
    } else {
        console.warn('First argument was not a string or object, therefore is not supported.');
        return;
    }
};

module.exports = new ConfigSvc();
