var $ = require('streamhub-sdk/jquery');
var AttachmentListView = require('streamhub-sdk/content/views/attachment-list-view');
var OembedView = require('streamhub-sdk/content/views/oembed-view');
var TiledAttachmentListTemplate = require('hgn!streamhub-sdk/content/templates/tiled-attachment-list');
var inherits = require('inherits');

'use strict';


/**
 * An AttachmentListView that tiles up to 4 photo and video attachments into one
 * square
 * @param opts {Object} A set of options to config the view with
 * @param opts.el {HTMLElement} The element in which to render the streamed content
 * @param opts.content {Content} The content instance with which to display its attachments
 * @fires TiledAttachmentListView#focusContent.hub
 * @exports streamhub-sdk/views/tiled-attachment-list-view
 * @constructor
 */
var TiledAttachmentListView = function (opts) {
    opts = opts || {};
    this.oembedViews = [];
    AttachmentListView.call(this, opts);
};
inherits(TiledAttachmentListView, AttachmentListView);

TiledAttachmentListView.prototype.template = TiledAttachmentListTemplate;
TiledAttachmentListView.prototype.tiledAttachmentsSelector = '.content-attachments-tiled';
TiledAttachmentListView.prototype.squareTileClassName = 'content-attachment-square-tile';
TiledAttachmentListView.prototype.horizontalTileClassName = 'content-attachment-horizontal-tile';
TiledAttachmentListView.prototype.contentAttachmentSelector = '.content-attachment';

TiledAttachmentListView.prototype._clickOrKey = function (e) {
    var targetOembed;
    for (var i = 0; i < this.oembedViews.length; i++) {
        var oembedView = this.oembedViews[i];
        if ($.contains(oembedView.el, e.target)) {
            targetOembed = oembedView.oembed;
            break;
        }
    }

    this.$el.trigger('focusContent.hub', { content: this.content, attachmentToFocus: targetOembed });
};

TiledAttachmentListView.prototype.events = AttachmentListView.prototype.events.extended({
    'click': function (e) {
        this._clickOrKey(e);
    },
    'keyup': function (e) {
        // only when return or space
        if (e.which === 13 || e.which === 32) {
            this._clickOrKey(e);
        }
    }
});

TiledAttachmentListView.prototype.render = function () {
    AttachmentListView.prototype.render.call(this);
    this.retile();

    var oembed;
    for (var i = 0; i < this.oembedViews.length; i++) {
        if (this.isTileableAttachment(this.oembedViews[i].oembed)) {
            oembed = this.oembedViews[i].oembed;
        }
    }


    if (oembed) {
        this.el.setAttribute('tabindex', 0);
        this.el.setAttribute('role', 'button');
        this.el.setAttribute('aria-label', 'Clicking this button expands the ' + oembed.provider_name + ' ' + oembed.type + ' in a modal');
    }
};


/**
 * Checks whether attachment is tileable
 * @returns {boolean} Whether an attachment is tileable
 */
TiledAttachmentListView.prototype.isTileableAttachment = function (oembed) {
    if (oembed.type === 'photo' || oembed.type === 'video') {
        return true;
    }
    return false;
};

/**
 * A count of the number of tileable attachments for this content item
 * @returns {boolean} The number of tileable attachments for this content item
 */
TiledAttachmentListView.prototype.tileableCount = function () {
    var attachmentsCount = 0;

    for (var i = 0; i < this.oembedViews.length; i++) {
        if (this.isTileableAttachment(this.oembedViews[i].oembed)) {
            attachmentsCount++;
        }
    }
    return attachmentsCount;
};

/**
 * Add a Oembed attachment to the Attachments view.
 * @param oembed {Oembed} A Oembed instance to render in the View
 * @returns {AttachmentListView} By convention, return this instance for chaining
 */
TiledAttachmentListView.prototype.add = function (oembed) {
    AttachmentListView.prototype.add.call(this, oembed);
    this.retile();
    return this;
};

TiledAttachmentListView.prototype._insert = function (oembedView) {
    var tiledAttachmentsEl = this.$el.find(this.tiledAttachmentsSelector);
    if (this.isTileableAttachment(oembedView.oembed)) {
        oembedView.$el.appendTo(tiledAttachmentsEl);
    }
};

/**
 * Removes a Oembed attachment from the Attachments view.
 * @param oembed {Oembed} A Oembed instance to remove
 */
TiledAttachmentListView.prototype.remove = function (oembed) {
    AttachmentListView.prototype.remove.call(this, oembed);
    this.retile();
};

/**
 * Retiles all attachments of the content
 */
TiledAttachmentListView.prototype.retile = function () {
    if (!this.el) {
        return;
    }
    var tiledAttachmentsEl = this.$el.find(this.tiledAttachmentsSelector);

    // Add classes to make thumbnails tile
    var attachmentsCount = this.tileableCount(this.oembedViews);
    tiledAttachmentsEl
        .removeClass('content-attachments-1')
        .removeClass('content-attachments-2')
        .removeClass('content-attachments-3')
        .removeClass('content-attachments-4');
    if (attachmentsCount && attachmentsCount <= 4) {
        // Only tile for <= 4 photo or video attachments
        tiledAttachmentsEl.addClass('content-attachments-' + attachmentsCount);
    }
    tiledAttachmentsEl.find(this.contentAttachmentSelector).addClass(this.squareTileClassName);
    if (attachmentsCount === 3) {
        tiledAttachmentsEl.find(this.contentAttachmentSelector + ':first')
            .removeClass(this.squareTileClassName)
            .addClass(this.horizontalTileClassName);
    } else if (attachmentsCount > 4) {
        tiledAttachmentsEl.find(this.contentAttachmentSelector)
            .removeClass(this.squareTileClassName)
            .addClass(this.horizontalTileClassName);
    } else {
        tiledAttachmentsEl.find(this.contentAttachmentSelector)
            .removeClass(this.horizontalTileClassName)
            .addClass(this.squareTileClassName);
    }
};

/**
 * A count of the number of attachments for this content item
 * @returns {int} The number of attachments for this content item
 */
TiledAttachmentListView.prototype.count = function () {
    var count = 0;
    for (var i = 0; i < this.oembedViews.length; i++) {
        if (this.isTileableAttachment(this.oembedViews[i].oembed)) {
            count++;
        }
    }
    return count;
};

module.exports = TiledAttachmentListView;
