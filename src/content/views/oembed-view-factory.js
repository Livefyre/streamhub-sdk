var EmbedyVideoOembedView = require('streamhub-sdk/content/views/oembed/embedly-video');
var LivefyreViewOembedView = require('streamhub-sdk/content/views/oembed/livefyre-video');
var OembedView = require('streamhub-sdk/content/views/oembed-view');
var VideoOembedView = require('streamhub-sdk/content/views/oembed/video');
var YoutubeVideoOembedView = require('streamhub-sdk/content/views/oembed/youtube-video');

'use strict';

module.exports = {};

/**
 * Map of provider strings to view class.
 * @const {Object}
 */
var VIDEO_PROVIDER_MAP = {
    Embedly: EmbedyVideoOembedView,
    Livefyre: LivefyreViewOembedView,
    YouTube: YoutubeVideoOembedView
};

/**
 * Creates the view to render the oembed content object
 * @param opts {Object} - OembedView configuration options.
 * @param opts.oembed {Oembed} - A Oembed instance to render in the View.
 * @returns {OembedView} 
 */
module.exports.createOembedView = function(opts) {
    var OembedCls = OembedView;
    var provider = opts.oembed.provider_name;
    if (opts.oembed.type === 'video') {
        OembedCls = VIDEO_PROVIDER_MAP[provider] || VideoOembedView;
    }
    return new OembedCls(opts);
};
