var AttachmentListView = require('streamhub-sdk/content/views/attachment-list-view');
var inherits = require('inherits');

'use strict';

/**
 * A view that displays a content item's links and rich attachments
 * as stacked block-level items.
 * @param opts {Object} A set of options to config the view with
 * @param opts.el {HTMLElement} The element in which to render the streamed content
 * @param opts.content {Content} The content instance with which to display its attachments
 * @exports streamhub-sdk/views/block-attachment-list-view
 * @constructor
 */
var BlockAttachmentListView = function (opts) {
    opts = opts || {};
    AttachmentListView.call(this, opts);
};
inherits(BlockAttachmentListView, AttachmentListView);

/**
 * Checks whether attachment is block-style. (aka link or rich)
 * @returns {boolean} Whether an attachment is block-style
 */
BlockAttachmentListView.prototype.isBlockAttachment = function (oembed) {
    return oembed && ['audio', 'photo', 'video'].indexOf(oembed.type) === -1;
};

BlockAttachmentListView.prototype._insert = function (oembedView) {
    var stackedAttachmentsEl = this.$el.find(this.stackedAttachmentsSelector);
    if (this.isBlockAttachment(oembedView.oembed)) {
        oembedView.$el.appendTo(stackedAttachmentsEl);
    }
};

/**
 * A count of the number of attachments for this content item
 * @returns {int} The number of attachments for this content item
 */
BlockAttachmentListView.prototype.count = function () {
    var count = 0;
    for (var i=0; i < this.oembedViews.length; i++) {
        if (this.isBlockAttachment(this.oembedViews[i].oembed)) {
            count++;
        }
    }
    return count;
};

module.exports = BlockAttachmentListView;
