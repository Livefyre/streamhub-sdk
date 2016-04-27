var inherits = require('inherits');
var VideoOembedView = require('streamhub-sdk/content/views/oembed/video');

'use strict';

/**
 * Embedly video oembed view.
 * Loads the embedly playerjs library if it doesn't exist already and uses
 * that to handle video related things.
 * @constructor
 * @param {Object} opts
 */
function EmbedyVideoOembedView(opts) {
    VideoOembedView.call(this, opts);
}
inherits(EmbedyVideoOembedView, VideoOembedView);

module.exports = EmbedyVideoOembedView;
