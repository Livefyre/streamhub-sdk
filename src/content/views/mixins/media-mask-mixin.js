var MediaMask = require('streamhub-sdk/content/views/media-mask');

'use strict';

/**
 * Provides function for rendering a MediaMask in the correct element and with
 * the correct properties.
 * @param {AttachmentListView} view
 * @param {Object} opts
 */
module.exports = function (view, opts) {
    opts = opts || {};

    /**
     * Render the MediaMask view with the provided oembed. If callback is
     * provided, it gets called when the mask is clicked, meaning the user has
     * agreed to see the oembed content.
     * @param {Object} oembed
     * @param {boolean} canShow
     * @param {function} callback
     */
    view.renderMediaMask = function (oembed, canShow, callback) {
        canShow = canShow && opts.doNotTrack.browser;
        if (!MediaMask.shouldShowMask(oembed, canShow, opts.doNotTrack.whitelist)) {
            callback && callback();
            return;
        }
        view._mask && view._mask.destroy();
        view._mask = new MediaMask({
            callback: callback,
            delegate: opts.doNotTrack.delegate,
            oembed: oembed
        });
        view.$el.find('.content-attachments-tiled').append(view._mask.render().$el);
    };
};
