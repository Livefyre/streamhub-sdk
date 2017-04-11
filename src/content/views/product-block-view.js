var $ = require('streamhub-sdk/jquery');
var i18n = require('streamhub-sdk/i18n');
var inherits = require('inherits');
var template = require('hgn!streamhub-sdk/content/templates/product-block');
var View = require('streamhub-sdk/view');

'use strict';

/**
 * A version of the tiled attachement list view that only shows a single image
 * @param opts {Object} A set of options to config the view with
 * @param opts.el {HTMLElement} The element in which to render the streamed content
 * @param opts.content {Content} The content instance with which to display its attachments
 * @fires TiledAttachmentListView#focusContent.hub
 * @exports streamhub-sdk/views/ProductBlockView
 * @constructor
 */
var ProductBlockView = function (opts) {
    opts = opts || {};
    View.call(this, opts);
};
inherits(ProductBlockView, View);

ProductBlockView.prototype.elTag = 'div';
ProductBlockView.prototype.elClass = 'product-block';
ProductBlockView.prototype.template = template;

ProductBlockView.prototype.getTemplateContext = function () {
    var context = $.extend({}, this.opts);
    context.productButtonText = i18n.get('productButtonText', 'Buy Now');
    context.productDetailPhotoShow = this.opts.productOptions.detail.photo;
    context.productDetailPriceShow = this.opts.productOptions.detail.price;
    context.productDetailTitleShow = this.opts.productOptions.detail.title;
    return context;
};

module.exports = ProductBlockView;
