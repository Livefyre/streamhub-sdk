var $ = require('streamhub-sdk/jquery');
var BlockAttachmentListView = require('streamhub-sdk/content/views/block-attachment-list-view');
var CompositeView = require('view/composite-view');
var ContentBodyView = require('streamhub-sdk/content/views/content-body-view');
var ContentFooterView = require('streamhub-sdk/content/views/content-footer-view');
var ContentHeaderView = require('streamhub-sdk/content/views/content-header-view');
var ContentHeaderViewFactory = require('streamhub-sdk/content/content-header-view-factory');
var ContentThumbnailViewFactory = require('streamhub-sdk/content/content-thumbnail-view-factory');
var debug = require('debug');
var get = require('mout/object/get');
var hasSpectrum = require('streamhub-sdk/content/views/mixins/spectrum-content-view-mixin');
var impressionUtil = require('streamhub-sdk/impressionUtil');
var inherits = require('inherits');
var TiledAttachmentListView = require('streamhub-sdk/content/views/tiled-attachment-list-view');

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
    opts.spectrum && hasSpectrum(this);

    this.content = opts.content;
    this.createdAt = new Date(); // store construction time to use for ordering if this.content has no dates
    this._headerViewFactory = opts.headerViewFactory || new ContentHeaderViewFactory();
    this._thumbnailViewFactory = new ContentThumbnailViewFactory(opts);

    CompositeView.call(this, opts);

    this._addInitialChildViews(opts);
    impressionUtil.recordImpression(opts.content);

    if (this.content) {
        this.content.on("change:visibility", function(newVis, oldVis) {
            this._handleVisibilityChange(newVis, oldVis);
        }.bind(this));

        this.content.on("change:featured", function (newVal, oldVal) {
            this._handleFeaturedChange(newVal, oldVal);
        }.bind(this));

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

/**
 * @param {Object} opts
 * @param {boolean=} shouldRender
 */
ContentView.prototype._addInitialChildViews = function (opts, shouldRender) {
    var renderOpts = {render: !!shouldRender};

    this._headerView = opts.headerView || this._headerViewFactory.createHeaderView(opts.content);
    this.add(this._headerView, renderOpts);

    this._thumbnailAttachmentsView = this._thumbnailViewFactory.createThumbnailView(opts);
    this._blockAttachmentsView = new BlockAttachmentListView(opts);
    this._attachmentsView = opts.attachmentsView || new CompositeView(this._thumbnailAttachmentsView, this._blockAttachmentsView);
    this.add(this._attachmentsView, renderOpts);

    this._bodyView = opts.bodyView || new ContentBodyView(opts);
    this.add(this._bodyView, renderOpts);

    this._footerView = opts.footerView || new ContentFooterView(opts);
    this.add(this._footerView, renderOpts);
};

ContentView.prototype._removeInitialChildViews = function () {
    this._headerView && this.remove(this._headerView);
    this._attachmentsView && this.remove(this._attachmentsView);
    this._bodyView && this.remove(this._bodyView);
    this._footerView && this.remove(this._footerView);
};

/**
 * Set the .el DOMElement that the ContentView should render to
 * @param el {DOMElement} The new element the ContentView should render to
 * @returns {ContentView}
 */
ContentView.prototype.setElement = function (el) {
    CompositeView.prototype.setElement.apply(this, arguments);

    var tileable = this._thumbnailAttachmentsView && this._thumbnailAttachmentsView.tileableCount();
    this.$el.toggleClass(this.imageLoadingClass, tileable);

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
    return $.extend({}, this.content);
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

ContentView.prototype._handleBodyChange = function (newVal, oldVal) {
    this._bodyView.render();
};

ContentView.prototype._handleAttachmentsChange = function () {
    this._removeInitialChildViews();
    this._addInitialChildViews(this.opts, true);
};

ContentView.prototype.destroy = function () {
    CompositeView.prototype.destroy.call(this);
    this.content = null;
};

/**
 * Render the content inside of the ContentView's element.
 * @returns {ContentView}
 */
ContentView.prototype.render = function () {
    /**
     * bengo:
     * This next 3 lines makes me sad, but it is necessary to support IE9.
     * View.prototype.render will set this.innerHTML to template().
     * For some reason, this also causes the innerHTML of the buttons to
     * be set to an empty string. e.g. Like Buttons have their like count
     * cleared out. When ._renderButtons later re-appendChilds all the
     * button.els, they are empty. So if we detach them here before
     * this.innerHTML is set, they are not cleared.
     * bit.ly/1no8mNk
     */
    if (hasInnerHtmlBug = testHasInnerHtmlBug()) {
        this._footerView._detachButtons();
    }

    CompositeView.prototype.render.call(this);
    return this;
};

function testHasInnerHtmlBug() {
    // only test once
    if (hasInnerHtmlBug !== null) {
        return hasInnerHtmlBug
    }
    var txt = 'hi';
    var parent = document.createElement('div');
    var child = document.createElement('span');
    child.appendChild(document.createTextNode(txt));
    parent.appendChild(child);
    parent.innerHTML = '';
    return child.innerHTML === '';
}

module.exports = ContentView;
