var BlockAttachmentListView = require('streamhub-sdk/content/views/block-attachment-list-view');
var CompositeView = require('view/composite-view');
var ContentBodyView = require('streamhub-sdk/content/views/spectrum/content-body-view');
var ContentFooterView = require('streamhub-sdk/content/views/spectrum/content-footer-view');
var ContentHeaderView = require('streamhub-sdk/content/views/spectrum/content-header-view');
var get = require('mout/object/get');
var ProductCalloutView = require('streamhub-sdk/content/views/product-callout-view');

'use strict';

/**
 * Overrides the provided `ContentView` class's `elClass` class name and
 * `_addInitialChildViews` method in order to style this in a spectrum-like way.
 * @param {ContentView} contentView The ContentView instance to be modified.
 */
module.exports = function (contentView) {
    // Remove the existing class that was added by the `setElement` call in the
    // constructor of `contentView`.
    contentView.$el.removeClass(contentView.elClass);

    /**
     * Override the property to add `spectrum-content` class.
     * @type {string}
     */
    contentView.elClass = 'content spectrum-content';

    // Add the new spectrum class to the `contentView` without calling
    // `setElement` again, as it does more things that we want.
    contentView.$el.addClass(contentView.elClass);

    /**
     * Override default `_addInitialChildViews` to change the order of content
     * within the card.
     * @override
     */
    contentView._addInitialChildViews = function (opts, shouldRender) {
        var renderOpts = {render: shouldRender || false};

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

        if ((get(opts, 'content.links.product') || []).length > 0) {
            this._productCalloutView = new ProductCalloutView({
                productOptions: opts.productOptions
            });
            this.add(this._productCalloutView, renderOpts);
        }
    };
};
