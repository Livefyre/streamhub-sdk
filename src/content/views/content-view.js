var $ = require('streamhub-sdk/jquery');
var CompositeView = require('view/composite-view');
var ContentHeaderView = require('streamhub-sdk/content/views/content-header-view');
var ContentBodyView = require('streamhub-sdk/content/views/content-body-view');
var ContentFooterView = require('streamhub-sdk/content/views/content-footer-view');
var TiledAttachmentListView = require('streamhub-sdk/content/views/tiled-attachment-list-view');
var BlockAttachmentListView = require('streamhub-sdk/content/views/block-attachment-list-view');
var ContentHeaderViewFactory = require('streamhub-sdk/content/content-header-view-factory');
var inherits = require('inherits');
var debug = require('debug');

'use strict';

var log = debug('streamhub-sdk/content/views/content-view');

/**
 * Defines the base class for all content-views. Handles updates to attachments
 * and loading of images.
 *
 * @param opts {Object} The set of options to configure this view with.
 * @param opts.content {Content} The content object to use when rendering. 
 * @param opts.el {?HTMLElement} The element to render this object in.
 * @param opts.headerView {View}
 * @param opts.bodyView {View}
 * @param opts.footerView {View}
 * @param opts.attachmentsView {View}
 * @fires ContentView#removeContentView.hub
 * @exports streamhub-sdk/content/views/content-view
 * @constructor
 */
var ContentView = function (opts) {
    opts = opts || {};

    this.content = opts.content;
    this.createdAt = new Date(); // store construction time to use for ordering if this.content has no dates
    this._headerViewFactory = opts.headerViewFactory || new ContentHeaderViewFactory();

    CompositeView.call(this, opts);

    this._addInitialChildViews(opts);

    if (this.content) {
        this.content.on("change:visibility", function(newVis, oldVis) {
            this._handleVisibilityChange(newVis, oldVis);
        }.bind(this));

        this.content.on("change:featured", function (newVal, oldVal) {
            this._handleFeaturedChange(newVal, oldVal);
        }.bind(this));
        // TODO: Re-render on change.
        // Removed for now because re-rendering a ContentView and
        // AttachmentsListView can unbind handlers important for modal
    }
};
inherits(ContentView, CompositeView);

ContentView.prototype.elTag = 'article';
ContentView.prototype.elClass = 'content';
ContentView.prototype.contentWithImageClass = 'content-with-image';
ContentView.prototype.imageLoadingClass = 'hub-content-image-loading';
ContentView.prototype.invalidClass = 'content-invalid';
ContentView.prototype.attachmentsElSelector = '.content-attachments';
ContentView.prototype.attachmentFrameElSelector = '.content-attachment-frame';

ContentView.prototype.events = CompositeView.prototype.events.extended({
    'imageLoaded.hub': function(e) {
        this.$el.addClass(this.contentWithImageClass);
        this.$el.removeClass(this.imageLoadingClass);

        e.stopPropagation();
        this.$el.parent().trigger('imageLoaded.hub', { contentView: this });
    },
    'imageError.hub': function(e, oembed) {
        this.content.removeAttachment(oembed);

        if (this._thumbnailAttachmentsView && !this._thumbnailAttachmentsView.tileableCount()) {
            this.$el.removeClass(this.contentWithImageClass);
            this.$el.removeClass(this.imageLoadingClass);
        }

        e.stopPropagation();
        this.$el.parent().trigger('imageError.hub', { oembed: oembed, contentView: this });
    }
});

ContentView.prototype._addInitialChildViews = function (opts) {
    this._headerView = opts.headerView || this._headerViewFactory.createHeaderView(opts.content);
    this.add(this._headerView, { render: false });

    this._thumbnailAttachmentsView = new TiledAttachmentListView(opts);
    this._blockAttachmentsView = new BlockAttachmentListView(opts);
    this._attachmentsView = opts.attachmentsView || new CompositeView(this._thumbnailAttachmentsView, this._blockAttachmentsView);
    this.add(this._attachmentsView, { render: false });

    this._bodyView = opts.bodyView || new ContentBodyView(opts);
    this.add(this._bodyView, { render: false });

    this._footerView = opts.footerView || new ContentFooterView(opts);
    this.add(this._footerView, { render: false });
};

/**
 * Set the .el DOMElement that the ContentView should render to
 * @param el {DOMElement} The new element the ContentView should render to
 * @returns {ContentView}
 */
ContentView.prototype.setElement = function (el) {
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
ContentView.prototype.getTemplateContext = function () {
    var context = $.extend({}, this.content);
    return context;
};

/**
 * Removes the content view element, and triggers 'removeContentView.hub'
 * event for the instance to be removed from its associated ListView.
 */
ContentView.prototype.remove = function () {
    /**
     * removeContentView.hub
     * @event ContentView#removeContentView.hub
     * @type {{contentView: ContentView}}
     */
    this.$el.trigger('removeContentView.hub', { contentView: this });
    this.$el.detach();
};

/**
 * Handles changes to the model's visibility.
 * @param ev
 * @param oldVis {string} Content.enum.visibility
 * @param newVis {string} Content.enum.visibility
 */
ContentView.prototype._handleVisibilityChange = function(newVis, oldVis) {
    if (newVis !== 'EVERYONE') {
        this.remove();
    }
};

ContentView.prototype._handleFeaturedChange = function (newVal, oldVal) {
    this._bodyView.render();
};

ContentView.prototype.destroy = function () {
    CompositeView.prototype.destroy.call(this);
    this.content = null;
};

module.exports = ContentView;
