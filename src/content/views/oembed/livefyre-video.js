var inherits = require('inherits');
var VideoOembedView = require('streamhub-sdk/content/views/oembed/video');

'use strict';

/**
 * Livefyre video oembed view.
 * @constructor
 * @param {Object} opts
 */
function LivefyreVideoOembedView(opts) {
    VideoOembedView.call(this, opts);

    /** @override */
    this._autoplaySupported = true;
}
inherits(LivefyreVideoOembedView, VideoOembedView);

module.exports = LivefyreVideoOembedView;
