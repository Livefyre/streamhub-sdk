var $ = require('streamhub-sdk/jquery');
var BlockAttachmentListView = require('streamhub-sdk/content/views/block-attachment-list-view');
var CompositeView = require('view/composite-view');
var ContentBodyView = require('streamhub-sdk/content/views/spectrum/content-body-view');
var ContentFooterView = require('streamhub-sdk/content/views/spectrum/content-footer-view');
var ContentHeaderView = require('streamhub-sdk/content/views/spectrum/content-header-view');
var get = require('mout/object/get');
var ProductCarouselView = require('streamhub-sdk/content/views/product-carousel-view');

'use strict';

/**
 * Overrides the provided `ContentView` class's `elClass` class name and
 * `_addInitialChildViews` method in order to style this in a spectrum-like way.
 * @param {ContentView} contentView The ContentView instance to be modified.
 */
module.exports = function (contentView) {
    /**
     * Override the property to add `spectrum-content` class.
     * @type {string}
     */
    contentView.elClass = 'content spectrum-content';

    /**
     * Override default `_addInitialChildViews` to change the order of content
     * within the card and add possibly add the product carousel depending on
     * content state.
     * @override
     */
    contentView._addInitialChildViews = function (opts, shouldRender) {
        var renderOpts = {render: !!shouldRender};

        this._thumbnailAttachmentsView = this._thumbnailViewFactory.createThumbnailView(opts);
        this._blockAttachmentsView = new BlockAttachmentListView(opts);
        this._attachmentsView = opts.attachmentsView ||
            new CompositeView(this._thumbnailAttachmentsView, this._blockAttachmentsView);
        this.add(this._attachmentsView, renderOpts);

        this._headerView = opts.headerView || new ContentHeaderView(
            this._headerViewFactory.getHeaderViewOptsForContent(opts.content));
        this.add(this._headerView, renderOpts);

        // If there is no body, don't add it because the styling is weird.
        if (opts.content.body) {
            this._bodyView = opts.bodyView || new ContentBodyView(opts);
            this.add(this._bodyView, renderOpts);
        }

        this._footerView = opts.footerView || new ContentFooterView(opts);
        this.add(this._footerView, renderOpts);

        var rightsGranted = opts.productOptions.requireRights ? opts.content.hasRightsGranted() : true;
        if (rightsGranted && opts.productOptions.show && opts.content.hasProducts()) {
            this._productCarouselView = new ProductCarouselView($.extend({cardsInView: 2}, opts));
            this.add(this._productCarouselView, renderOpts);
        }
    };

    var originalRemoveInitialChildViews = contentView._removeInitialChildViews;

    /** @override */
    contentView._removeInitialChildViews = function (opts, shouldRender) {
        originalRemoveInitialChildViews.call(contentView, opts, shouldRender);
        this._productCarouselView && this.remove(this._productCarouselView);
    };
};
