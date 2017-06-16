var $ = require('streamhub-sdk/jquery');
var TiledAttachmentListView = require('streamhub-sdk/content/views/tiled-attachment-list-view');
var inherits = require('inherits');

'use strict';

/**
 * A version of the tiled attachement list view that only shows a single image
 * @param opts {Object} A set of options to config the view with
 * @param opts.el {HTMLElement} The element in which to render the streamed content
 * @param opts.content {Content} The content instance with which to display its attachments
 * @fires TiledAttachmentListView#focusContent.hub
 * @exports streamhub-sdk/views/single-attachment-view
 * @constructor
 */
var SingleAttachmentListView = function (opts) {
    opts = opts || {};
    TiledAttachmentListView.call(this, opts);
};
inherits(SingleAttachmentListView, TiledAttachmentListView);

SingleAttachmentListView.prototype.additionalImagesSelector = '.content-attachment-additional-images';
SingleAttachmentListView.prototype.photoContentSelector = '.content-attachment-photo';

SingleAttachmentListView.prototype.numberOfAttachments = function () {

}
SingleAttachmentListView.prototype.retile = function (index) {
    if (index === undefined || this.getCurrentNumberOfAttachments() <= index) {
        index = 0;
    }
    if ( ! this.el ) {
        return;
    }
    var tiledAttachmentsEl = this.$el.find(this.tiledAttachmentsSelector);
    // Add classes so only the first media shows and the other remain hidden
    tiledAttachmentsEl.addClass('content-attachments-1');

    var visibleItemEl = tiledAttachmentsEl.find(this.contentAttachmentSelector);
    visibleItemEl = visibleItemEl[index];
    if (visibleItemEl) {
        visibleItemEl = $(visibleItemEl);
        this.$el.find('.'+this.squareTileClassName).removeClass(this.squareTileClassName);
        visibleItemEl.addClass(this.squareTileClassName);
        if (this.tileableCount() > 1 && visibleItemEl.find(this.additionalImagesSelector).length === 0) {
            var imageCountDom = '<span class="content-attachment-additional-images">+' + (this.tileableCount() - 1) + '</span>';
            visibleItemEl.find(this.photoContentSelector).append(imageCountDom);
        }
    }
};

module.exports = SingleAttachmentListView;
