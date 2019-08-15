var get = require('mout/object/get');
var inherits = require('inherits');
var template = require('hgn!streamhub-sdk/content/templates/instagram-native');
var View = require('view');

'use strict';

/**
 * Instagram native view.
 * @constructor
 * @extends {View}
 * @param {Object} opts
 */
function InstagramNativeView(opts) {
    View.call(this);

    /**
     * The first attachment in the list. This is where the thumbnail comes from.
     * @type {Object}
     */
    this.attachment = (get(opts, 'content.attachments.0') || {});

    /**
     * Should the JavaScript be loaded immediately? This should always be true
     * unless the GDPR media mask is going to display.
     * @type {boolean}
     */
    this.autoload = typeof opts.autoload === 'boolean' ? opts.autoload : true;

    /**
     * Loading status of the native embed.
     * @type {boolean}
     */
    this.loading = false;
}
inherits(InstagramNativeView, View);

InstagramNativeView.prototype.elClass = 'instagram-native';
InstagramNativeView.prototype.shortcodeRegex = /^(https?:\/\/(www.)?instagram.com\/)([^\/]+\/)?(p\/[^\/]+(\/)?)$/;
InstagramNativeView.prototype.template = template;

/**
 * Gets the canonical form of the shortcode url. This needs to be handled
 * carefully because it's possible that we have received bad data from the
 * backend (basically from FB APIs) and need to ensure it's in the proper
 * format.
 */
InstagramNativeView.prototype.getCanonicalShortcodeUrl = function () {
    if (!this.attachment.link || !this.shortcodeRegex.test(this.attachment.link)) {
        return '';
    }
    return this.attachment.link
        .replace(this.shortcodeRegex, 'https://www.instagram.com/$4/')
        .replace(/\/+$/g, '');
};

/** @override */
InstagramNativeView.prototype.getTemplateContext = function () {
    return {
        link: this.getCanonicalShortcodeUrl(),
        media: this.attachment.thumbnail_url
    };
};

/**
 * Handle iFrame loaded event. Set loading to completed and do things.
 */
InstagramNativeView.prototype.handleIframeLoad = function () {
    this.loading = false;
    // Technically this is when the iframe is loaded, but using a timeout to
    // ensure the UI is completely finished.
    setTimeout(this.$el.trigger.bind(this.$el, 'igNativeLoaded.hub'), 500);
    setTimeout(this.$el.trigger.bind(this.$el, 'igNativeLoaded.hub'), 1000);
};

/**
 * Load the native embed if it isn't already being loaded. If the Instagram
 * embed JavaScript has been previously loaded, use the global object, otherwise
 * load the JavaScript which automatically does it.
 */
InstagramNativeView.prototype.load = function () {
    if (this.loading) {
        return;
    }

    this.$el.find('.fyr-loader').css({display: 'block'});
    this.loading = true;
    this.pollForIframe();

    if (window.instgrm) {
        return window.instgrm.Embeds.process();
    }
    var script = document.createElement('script');
    script.src = '//instagram.com/embed.js';
    this.el.appendChild(script);
};

/**
 * Poll the DOM for the native Instagram iFrame.
 */
InstagramNativeView.prototype.pollForIframe = function () {
    var elem = this.el.children[0];
    if (elem.nodeName === 'IFRAME') {
        elem.onload = this.handleIframeLoad.bind(this);
        return;
    }
    setTimeout(this.pollForIframe.bind(this), 10);
};

/** @override */
InstagramNativeView.prototype.render = function () {
    View.prototype.render.call(this);
    this.autoload && this.load();
    return this;
};

module.exports = InstagramNativeView;
