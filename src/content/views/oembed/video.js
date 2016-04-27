var $ = require('streamhub-sdk/jquery');
var analyticsUtil = require('streamhub-sdk/util/analytics');
var inherits = require('inherits');
var OembedView = require('streamhub-sdk/content/views/oembed-view');

'use strict';

/**
 * Video oembed view.
 * Contains all of the controls and some insights event triggering.
 * @constructor
 * @param {Object} opts
 */
function VideoOembedView(opts) {
    OembedView.call(this, opts);

    /**
     * Whether autoplay is supported.
     * @type {boolean}
     * @private
     */
    this._autoplaySupported = false;

    /**
     * Interval to track clicks on the iframe.
     * @type {?number}
     * @private
     */
    this._frameClickInterval = null;

    /**
     * Whether the video is playing or not.
     * @type {boolean}
     * @private
     */
    this._playing = false;

    /**
     * Whether to render the video or the image thumbnail.
     * @type {boolean}
     * @private
     */
    this._showVideo = opts.showVideo || false;
}
inherits(VideoOembedView, OembedView);

/** @override */
VideoOembedView.prototype.destroy = function () {
    clearInterval(this._frameClickInterval);
    this._frameClickInterval = null;
    // TODO: Send insights event for playback %?
    OembedView.prototype.destroy.call(this);
};

/**
 * Get the embed html from the oembed. Processes iframes specially by possibly
 * adding autoplay to them depending on the provider.
 * @return {string}
 */
VideoOembedView.prototype.getEmbedHtml = function () {
    var attachment = this.oembed;
    var $html = $(attachment.html);
    var iframe = $html[0].tagName === 'IFRAME' ? $html[0] : $html.find('iframe')[0];

    // If there isn't an iframe in the attachment html, nothing more to do.
    if (!iframe) {
        return attachment.html;
    }

    this.modifyIframeSource(iframe);
    return $('<div>').append($html).html();
};

/**
 * Get the percentage of the video watched.
 * @return {number}
 */
VideoOembedView.prototype.getPlaybackPercentage = function () {
    return (this.getPlaybackTime() / this.getVideoLength()) * 100;
};

/**
 * Get the current playback time of the video in seconds.
 * @return {number}
 */
VideoOembedView.prototype.getPlaybackTime = function () {};

/**
 * Get the length of the video in seconds.
 * @return {number}
 */
VideoOembedView.prototype.getVideoLength = function () {};

/**
 * Initialize the tracker that detects when the user takes actions on the video.
 * It is impossible to tell what the user clicked on within the iframe, so this
 * is a limited solution that only assumes that all clicks are pause/play.
 */
VideoOembedView.prototype.initializeIframeTracker = function () {
    var iframe = this.$el.find('iframe')[0];
    var self = this;

    // This only supports iframes.
    if (!iframe) {
        return;
    }

    /**
     * Clear the frame tracking interval.
     */
    function clearTrackingInterval() {
        clearInterval(self._frameClickInterval);
        self._frameClickInterval = null;
    }

    this.$el.on('mouseover', function () {
        self._frameClickInterval = setInterval(function () {
            var elem = document.activeElement;
            if (elem === iframe) {
                self._playing = !self._playing;
                self._playing && self.trackPlay();
                clearTrackingInterval();
                elem.blur();
            }
        }, 100);
    }).on('mouseout', clearTrackingInterval);
};

/**
 * Play the video if autoplay is enabled, otherwise do nothing.
 */
VideoOembedView.prototype.maybePlay = function () {
    if (this._autoplaySupported) {
        this.trackPlay();
        this._playing = true;
    }
};

/**
 * Modify the iframe source attribute to add autoplay if supported.
 * @param {Element} iframe - Iframe to modify.
 */
VideoOembedView.prototype.modifyIframeSource = function (iframe) {
    if (!this._autoplaySupported) {
        return;
    }
    iframe.src += (iframe.src.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1';
};

/** @override */
VideoOembedView.prototype.render = function () {
    if (this._showVideo) {
        return this.renderVideo();
    }
    return OembedView.prototype.render.call(this);
};

/**
 * Render the video.
 */
VideoOembedView.prototype.renderVideo = function () {
    this.$el.html(this.template(this.oembed));
    this.$el.find('.content-attachment-photo').hide();
    this.$el.find('.content-attachment-controls-play').hide();

    var $attachmentEl = this.$el.find('.content-attachment-video');
    $attachmentEl.append(this.getEmbedHtml());
    $attachmentEl.show();

    this.resizeVideo();
    this._autoplaySupported || this.initializeIframeTracker();
};

/**
 * Resize the iframe.
 */
VideoOembedView.prototype.resizeVideo = function () {
    var oembed = this.oembed;
    var $videoIframe = this.$el.find('iframe');
    if ($videoIframe && oembed.width && oembed.height) {
        $videoIframe.attr('width', oembed.width);
        $videoIframe.attr('height', oembed.height);
    }
};

/**
 * Track the video play action.
 */
VideoOembedView.prototype.trackPlay = function () {
    // For now this is a hack to ensure that play is only called once per
    // video instance. The problem is that iframes can have other controls so
    // clicks don't mean the user is toggling play/pause.
    if (this._hasSentPlay) {
        return;
    }
    this.$el.trigger('insights:local', {
        type: 'VideoPlay',
        video: analyticsUtil.oembedObjectEntityFromModel(this.oembed)
    });
    this._hasSentPlay = true;
};

module.exports = VideoOembedView;
