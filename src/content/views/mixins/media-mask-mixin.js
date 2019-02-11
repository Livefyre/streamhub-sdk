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
    view.renderMediaMask = function (oembed, canShow, callback, el) {
        if (!view.willShowMask(oembed, canShow)) {
            callback && callback();
            return;
        }
        view._mask && view._mask.destroy();
        view._mask = new MediaMask({
            callback: callback,
            delegate: (opts.doNotTrack || {}).delegate,
            oembed: oembed
        });
        if (el) {
            el.append(view._mask.render().el);
        } else {
            view.$el.find('.content-attachments-tiled').append(view._mask.render().$el);
        }

    };

    view.willShowMask = function (oembed, canShow) {
        var doNotTrack = opts.doNotTrack || {};
        canShow = canShow && doNotTrack.browser;
        return MediaMask.shouldShowMask(oembed, canShow, doNotTrack.whitelist);
    };
};
