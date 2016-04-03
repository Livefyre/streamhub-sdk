var bind = require('mout/function/bind');
var equals = require('mout/object/equals');
var EventEmitter = require('event-emitter');
var fillIn = require('mout/object/fillIn');
var filter = require('mout/object/filter');
var inherits = require('inherits');
var LivefyreTranslationClient = require('streamhub-sdk/collection/clients/translation-client');
var merge = require('mout/object/merge');
var mixIn = require('mout/object/mixIn');
var size = require('mout/object/size');

'use strict';

/**
 * Enum of events triggered by this class.
 * @enum {string}
 */
var EVENTS = {
    RECEIVED: 'translationsReceived',
    UPDATED: 'translationsUpdated'
};

/**
 * Default string translations. The values are arrays to support multiple
 * string replacement.
 * @const {Object}
 */
var I18N_MAP = {
    postButtonText: ['POST', 'POST_PHOTO'],
    postModalTitle: ['POST_MODAL_TITLE'],
    postModalButton: ['POST_MODAL_BUTTON'],
    postModalPlaceholder: ['PLACEHOLDERTEXT']
};

/**
 * Translations class.
 * Stores all i18n translations for an app. Has functions for updating and
 * retrieving translations.
 * @constructor
 * @extends {EventEmitter}
 */
function Translations() {
    EventEmitter.call(this);

    /**
     * App type to request translations for.
     * @type {string=}
     * @private
     */
    this._appType;

    /**
     * Has the translations object changed since last time we checked?
     * @type {boolean}
     * @private
     */
    this._changed = false;

    /**
     * Translation client used for fetching translations.
     * @type {LivefyreTranslationClient}
     * @private
     */
    this._client = new LivefyreTranslationClient();

    /**
     * The translations object that stores key-value pairs of translations.
     * @type {Object}
     * @private
     */
    this._i18n = {};

    /**
     * Map for transforming the translations into a usable form.
     * @type {Object=}
     * @private
     */
    this._translationMap;
}
inherits(Translations, EventEmitter);

/**
 * Fetch the translations from the server.
 * @param {Object} opts - Fetch options.
 */
Translations.prototype.fetch = function (opts) {
    opts.appType = this._appType;
    this._client.getTranslations(opts, bind(this._handleTranslationsReceived, this));
};

/**
 * Get the translation for the provided `key`.
 * @param {string} key - Translation key to get.
 * @param {string} defaultValue - Default value to use if key doesn't exist.
 * @return {string=}
 */
Translations.prototype.get = function (key, defaultValue) {
    return this._i18n[key] || defaultValue;
};

/**
 * Get all translations.
 * @return {Object}
 */
Translations.prototype.getAll = function () {
    return this._i18n;
};

/**
 * Translations received callback from the fetch request. This translates the
 * new data and puts it into the map.
 * @param {Object=} err - Response error.
 * @param {Object} data - Response object.
 * @private
 */
Translations.prototype._handleTranslationsReceived = function (err, res) {
    if (!err) {
        this.translate({data: res.data, fillIn: true, merge: true});
    }
    this.emit(EVENTS.RECEIVED);
};

/**
 * Check whether the translations have changed since the last time this function
 * has been called.
 * @return {boolean}
 */
Translations.prototype.hasChanged = function () {
    var changed = this._changed;
    this._changed = false;
    return changed;
};

/**
 * Initialize the translation service. Clears out existing translations because
 * it is probably being used for a new app. There is no reason to initialize
 * multiple times for the same app.
 * @param {Object} opts - Configuration options.
 * @param {string} opts.appType - Type of app to fetch translations for.
 * @param {Object} opts.translationMap - Map for transforming translations.
 */
Translations.prototype.initialize = function (opts) {
    this._appType = opts.appType;
    this._translationMap = opts.translationMap;
    this._i18n = {};
};

/**
 * Check if the translation set is empty.
 * @return {boolean}
 */
Translations.prototype.isEmpty = function () {
    return size(this._i18n) === 0;
};

/**
 * Remove translations from the set.
 * @param {string|Array.<string>} keys - Key(s) to remove from the set.
 */
Translations.prototype.remove = function (keys) {
    if (typeof(keys) === 'string') {
        keys = [keys];
    }
    for (var i = 0; i < keys.length; i++) {
        delete this._i18n[keys[i]];
    }
};

/**
 * Reset the translation data.
 * @param {boolean=} opt_emitChanged - Whether to emit changed event or not.
 */
Translations.prototype.reset = function (opt_emitChanged) {
    this._changed = true;
    this._i18n = {};
    opt_emitChanged && this.emit(EVENTS.UPDATED);
};

/**
 * Set a translation value via key/value pair or an object of pairs.
 * @param {string|Object} key - Key of pair or object containing pairs.
 * @param {string|Object=} value - Value of pair or options object.
 * @param {Object=} opts - Optional options.
 */
Translations.prototype.set = function (key, value, opts) {
    // The key is a string, so that means `key` can be used as the key and
    // `value` can be used as a string value.
    if (typeof(key) === 'string') {
        this._i18n[key] = value;

    // The key is an object, so that means it contains any number of key/value
    // pairs and we can just mix the 2 objects together. This also means that
    // the options object is now in the `value` argument position.
    } else if (typeof(key) === 'object') {
        mixIn(this._i18n, key);
        opts = value;

    // All supported types have been checked, so now there is nothing to do.
    } else {
        console.warn('First argument was not a string or object, therefore is not supported.');
        return;
    }

    this._changed = true;
    // If the silent option was passed, don't trigger an update event.
    (opts || {}).silent || this.emit(EVENTS.UPDATED);
};

/**
 * Set the i18n data. This sets the _changed flag and triggers a changed event
 * if there were any changes. The `opt_fillIn` argument determines what type of
 * merge will be applied to the data.
 * @param {Object} opts - Configuration options.
 * @param {Object} opts.data - New translation data.
 * @param {boolean=} opts.fillIn - Whether to fillIn the new data or override.
 * @param {boolean=} opts.silent - Whether to trigger updated event or not.
 * @private
 */
Translations.prototype._set = function (opts) {
    var fn = opts.fillIn ? fillIn : mixIn;
    var merged = {};

    // Only keep translations whose values are strings. It's possible that there
    // could be non-string values due to how custom strings have been supported
    // in the past (passed as a top level attribute on the `opts` object).
    var data = filter(opts.data, function (v) {
        return typeof(v) === 'string';
    });

    fn(merged, this._i18n, data);
    var changed = this._changed = !equals(merged, this._i18n);
    var shouldTrigger = 'silent' in opts ? !opts.silent : true;
    this._i18n = merged;
    changed && shouldTrigger && this.emit(EVENTS.UPDATED);
    return changed;
};

/**
 * Translate standard configuration option keys into the values that are used
 * in the SDK. Optionally, a custom map can be provided to support additional
 * keys not supported by default.
 * @param {Object} opts - Configuration options.
 * @param {Object} opts.data - Data to translate.
 * @param {boolean=} opts.fillIn - Whether to fillIn the new data or override.
 * @param {boolean=} opts.merge - Whether to merge the original opts strings
 *   with the translations.
 * @return {Object}
 */
Translations.prototype.translate = function (opts) {
    var data = opts.data;
    var _i18n = {};
    var key;
    var map = merge(I18N_MAP, this._translationMap || {});
    var value;
    delete opts.data;

    for (key in map) {
        if (!map.hasOwnProperty(key) || !(key in data)) {
            continue;
        }
        value = map[key];
        for (var i = 0; i < value.length; i++) {
            _i18n[value[i]] = data[key];
        }
        delete data[key];
    }

    // Possibly merge the transformed translations with the original data
    // object to catch any translations that didn't need to be transformed.
    opts.data = opts.merge ? merge(data, _i18n) : _i18n;
    return this._set(opts);
};

module.exports = new Translations();
module.exports.EVENTS = EVENTS;
module.exports.I18N_MAP = I18N_MAP;
