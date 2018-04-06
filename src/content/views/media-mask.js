'use strict';

var $ = require('jquery');
var find = require('mout/array/find');
var inherits = require('inherits');
var View = require('streamhub-sdk/view');

/**
 * Media mask that shows over media thumbnails for Do Not Track enabled browsers.
 * @constructor
 * @extends {View}
 * @param {Object} opts
 */
function MediaMask(opts) {
    View.call(this, opts);

    /**
     * Whether the mask should be shown or not.
     * @type {boolean}
     * @private
     */
    this._showMask = true;
}
inherits(MediaMask, View);

MediaMask.prototype.containerSelector = '.media-mask-container';
MediaMask.prototype.elClass = 'media-mask';
MediaMask.prototype.events = {
    'click': 'onBodyClick',
    'click .show-embed': 'onShowClick'
};
MediaMask.prototype.showBtnSelector = '.show-embed';
MediaMask.prototype.template = require('hgn!streamhub-sdk/content/templates/media-mask');

/**
 * List of providers whose videos can't be whitelisted via the whitelist array.
 * @const {Array.<string>}
 */
var NON_WHITELISTABLE_PROVIDERS = [
    'facebook',
    'instagram',
    'twitter',
    'youtube'
];

/**
 * Supported oembed types that should be masked.
 * @const {Array}
 */
var SUPPORTED_TYPES = ['video'];

/**
 * Handle the click event on the mask body. Don't allow the event to bubble,
 * because that will cause the mask to be removed.
 * @param {Event} evt
 */
MediaMask.prototype.onBodyClick = function (evt) {
    evt.stopPropagation();
};

/**
 * Handle the click event on the show button. If an anchor was clicked,
 * don't allow the event to bubble, because that will cause the mask to be
 * removed.
 * @param {Event} evt
 */
MediaMask.prototype.onShowClick = function (evt) {
    evt.stopPropagation();
    this.opts.oembed.viewed = true;
    this._showMask = false;
    this.render();
    this.opts.callback && this.opts.callback();
};

/** @override */
MediaMask.prototype.render = function () {
    // Don't show the media mask if the oembed type isn't supported or if the
    // oembed provider is whitelisted.
    if (!this._showMask) {
        this.$el.hide();
        return this;
    }

    View.prototype.render.call(this);

    // If the DNT delegate function is provided, replace the default content
    // with the new content. This supports string responses (wrapped in a
    // paragraph) and DOM responses.
    if (typeof this.opts.delegate === 'function') {
        var dom = this.opts.delegate();
        if (typeof dom === 'string') {
            dom = !$(dom).length ? $('<p />').html(dom) : $(dom);
        }
        this.$el.find(this.containerSelector + ' > *').not(this.showBtnSelector).remove();
        this.$el.find(this.containerSelector).prepend(dom);
    }
    return this;
};

/**
 * Whether or not the mask should be shown.
 * @param {Object} oembed
 * @param {boolean} canShow
 * @return {boolean}
 */
MediaMask.shouldShowMask = function (oembed, canShow, whitelist) {
    var supportsMask = SUPPORTED_TYPES.indexOf(oembed.type) > -1;
    var providerName = (oembed.provider_name || '').toLowerCase();
    var videoSrc = oembed.html || oembed.url || '';
    // Livefyre videos do not have the domain of the video in the html, so it
    // needs to be pulled from another location.
    var livefyreVideoSrc = oembed.url || oembed.link || '';

    // If argument says we can't show, the oembed type is not a supported mask
    // type, or the mask has been dismissed already, don't show the mask.
    if (!canShow || !supportsMask || oembed.viewed) {
        return false;
    }
    // Video html tags can't be tracked.
    if (videoSrc.match(/^<video[^>]*>$/)) {
        return false;
    }
    // Twitter supports DNT and we add meta to the page if it's not there
    // already to ensure it's handled correctly on their end.
    if (providerName === 'twitter' && videoSrc.indexOf('twimg.com') > -1) {
        return false;
    }
    // Livefyre providers with cloudfront videos are uploaded by users on our
    // platform, so we control it and know there is no tracking.
    if (providerName === 'livefyre' && livefyreVideoSrc.indexOf('cloudfront.net') > -1) {
        return false;
    }
    // Don't allow whitelisting of social providers because this is only
    // targeted at customers using their own hosted media.
    if (NON_WHITELISTABLE_PROVIDERS.indexOf(providerName) > -1) {
        return true;
    }
    // If any of the whitelisted domains are in the source, don't show the mask.
    if (find(whitelist, function (domain) {return videoSrc.indexOf(domain) > -1})) {
        return false;
    }
    return true;
};

module.exports = MediaMask;
