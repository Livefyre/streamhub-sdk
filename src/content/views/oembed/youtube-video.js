var inherits = require('inherits');
var VideoOembedView = require('streamhub-sdk/content/views/oembed/video');

'use strict';

/**
 * Youtube video oembed view.
 * Loads the youtube iframe api library if it doesn't exist already and uses
 * that to handle video related things.
 * @constructor
 * @param {Object} opts
 */
function YoutubeOembedView(opts) {
    VideoOembedView.call(this, opts);

    /** @override */
    this._autoplaySupported = true;
}
inherits(YoutubeOembedView, VideoOembedView);

/**
 * Modify the iframe source attribute to add autoplay (inherited) and don't
 * show related videos.
 * @param {Element} iframe - Iframe to modify.
 * @override
 */
YoutubeOembedView.prototype.modifyIframeSource = function (iframe) {
    VideoOembedView.prototype.modifyIframeSource.call(this, iframe);

    var srcIndex = iframe.src.indexOf('src=');
    var nextAmpersand = iframe.src.indexOf('&', srcIndex);

    // TODO: How is this supposed to work?
    if (srcIndex > -1 && nextAmpersand > -1) {
        iframe.src = iframe.src.substring(0, nextAmpersand) + '%26rel%3D0' + iframe.src.substring(nextAmpersand);
    }
};

module.exports = YoutubeOembedView;
