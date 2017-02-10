var $ = require('streamhub-sdk/jquery');
var CompositeView = require('view/composite-view');
var TiledAttachmentListView = require('streamhub-sdk/content/views/tiled-attachment-list-view');
var BlockAttachmentListView = require('streamhub-sdk/content/views/block-attachment-list-view');
var ContentThumbnailViewFactory = require('streamhub-sdk/content/content-thumbnail-view-factory');
var ProductContentView = require('streamhub-sdk/content/views/product-content-view');
var inherits = require('inherits');
var debug = require('debug');
var impressionUtil = require('streamhub-sdk/impressionUtil');

'use strict';

var hasInnerHtmlBug = null;
var log = debug('streamhub-sdk/content/views/content-view');

/**
 * Defines the base class for all content-views. Handles updates to attachments
 * and loading of images.
 *
 * @param opts {Object} The set of options to configure this view with.
 * @param opts.content {Content} The content object to use when rendering.
 * @param opts.el {?HTMLElement} The element to render this object in.
 * @param opts.attachmentsView {View}
 * @fires ModalContentCardView#removeModalContentCardView.hub
 * @exports streamhub-sdk/content/views/content-view
 * @constructor
 */
var ModalContentCardView = function (opts) {
    opts = opts || {};

    this.content = opts.content;
    this.createdAt = new Date(); // store construction time to use for ordering if this.content has no dates
    this._thumbnailViewFactory = new ContentThumbnailViewFactory(opts);

    CompositeView.call(this, opts);

    this._addInitialChildViews(opts);
    impressionUtil.recordImpression(opts.content);

    if (this.content) {
        this.content.on("change:body", function(newVal, oldVal){
            this._handleBodyChange();
        }.bind(this));

        this.content.on("change:attachments", function(newVal, oldVal){
            this._handleAttachmentsChange();
        }.bind(this));

        this.$el.on('insights:local', function (evt, data) {
            if (data.type.search(/^Share(?:T|F|U)/) < 0) {
                data.content = opts.content;
            }
        });
    }
};
inherits(ModalContentCardView, CompositeView);

ModalContentCardView.prototype.elTag = 'article';
ModalContentCardView.prototype.elClass = 'content';
ModalContentCardView.prototype.contentWithImageClass = 'content-with-image';
ModalContentCardView.prototype.imageLoadingClass = 'hub-content-image-loading';
ModalContentCardView.prototype.invalidClass = 'content-invalid';
ModalContentCardView.prototype.attachmentsElSelector = '.content-attachments';
ModalContentCardView.prototype.attachmentFrameElSelector = '.content-attachment-frame';

ModalContentCardView.prototype.events = CompositeView.prototype.events.extended({
    'imageLoaded.hub': function(e) {
        this.$el.addClass(this.contentWithImageClass);
        this.$el.removeClass(this.imageLoadingClass);

        e.stopPropagation();
        this.$el.parent().trigger('imageLoaded.hub', { ModalContentCardView: this });
    },
    'imageError.hub': function(e, oembed) {
        this.content.removeAttachment(oembed);

        if (this._thumbnailAttachmentsView && !this._thumbnailAttachmentsView.tileableCount()) {
            this.$el.removeClass(this.contentWithImageClass);
            this.$el.removeClass(this.imageLoadingClass);
        }

        e.stopPropagation();
        this.$el.parent().trigger('imageError.hub', { oembed: oembed, ModalContentCardView: this });
    }
});

/**
 * @param {Object} opts
 * @param {boolean=} shouldRender
 */
ModalContentCardView.prototype._addInitialChildViews = function (opts, shouldRender) {
    shouldRender = shouldRender || false;
    this._thumbnailAttachmentsView = this._thumbnailViewFactory.createThumbnailView(opts);
    this._blockAttachmentsView = new BlockAttachmentListView(opts);
    this._attachmentsView = opts.attachmentsView || new CompositeView(this._thumbnailAttachmentsView, this._blockAttachmentsView);
    this.add(this._attachmentsView, { render: shouldRender });

    this._productContentView = opts.productContentView || new ProductContentView(opts);
    this.add(this._productContentView, { render: shouldRender });
};

ModalContentCardView.prototype._removeInitialChildViews = function () {
    this.remove(this._attachmentsView);
    this.remove(this._productContentView);
};

/**
 * Set the .el DOMElement that the ModalContentCardView should render to
 * @param el {DOMElement} The new element the ModalContentCardView should render to
 * @returns {ModalContentCardView}
 */
ModalContentCardView.prototype.setElement = function (el) {
    CompositeView.prototype.setElement.apply(this, arguments);

    if (this._thumbnailAttachmentsView && this._thumbnailAttachmentsView.tileableCount()) {
        this.$el.addClass(this.imageLoadingClass);
    }

    if (this.content && this.content.id) {
        this.$el.attr('data-content-id', this.content.id);
    }

    return this;
};

/**
 * Gets the template rendering context. By default, returns "this.content".
 * @returns {Content} The content object this view was instantiated with.
 */
ModalContentCardView.prototype.getTemplateContext = function () {
    var context = $.extend({}, this.content);
    return context;
};

/**
 * Removes the content view element, and triggers 'removeModalContentCardView.hub'
 * event for the instance to be removed from its associated ListView.
 */
ModalContentCardView.prototype.remove = function () {
    /**
     * removeModalContentCardView.hub
     * @event ModalContentCardView#removeModalContentCardView.hub
     * @type {{ModalContentCardView: ModalContentCardView}}
     */
    this.$el.trigger('removeModalContentCardView.hub', { ModalContentCardView: this });
    this.$el.detach();
};

ModalContentCardView.prototype._handleBodyChange = function (newVal, oldVal) {
    this._bodyView.render();
};

ModalContentCardView.prototype._handleAttachmentsChange = function () {
    this._removeInitialChildViews();
    this._addInitialChildViews(this.opts, true);
};

ModalContentCardView.prototype.destroy = function () {
    CompositeView.prototype.destroy.call(this);
    this.content = null;
};

/**
 * Render the content inside of the ModalContentCardView's element.
 * @returns {ModalContentCardView}
 */
ModalContentCardView.prototype.render = function () {
    CompositeView.prototype.render.call(this);
    return this;
};

module.exports = ModalContentCardView;
