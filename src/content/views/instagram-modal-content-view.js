var $ = require('streamhub-sdk/jquery');
var asMediaMaskMixin = require('streamhub-sdk/content/views/mixins/media-mask-mixin');
var CompositeView = require('view/composite-view');
var inherits = require('inherits');
var InstagramNativeView = require('streamhub-sdk/content/views/instagram-native-view');
var Popover = require('streamhub-ui/popover');
var ProductCTACalloutView = require('streamhub-sdk/content/views/product-cta-callout-view');

'use strict';

/**
 * Instagram modal content view. Handles all Instagram related modal
 * functionality including native embeds, showing the media mask for GDPR, and
 * loads the product and cta popover.
 * @constructor
 * @extends {CompositeView}
 * @param {Object} opts
 */
function InstagramModalContentView(opts) {
    opts = opts || {};
    CompositeView.call(this, opts);
    asMediaMaskMixin(this, opts);
}
inherits(InstagramModalContentView, CompositeView);

InstagramModalContentView.prototype.elClass = 'content instagram-modal';
InstagramModalContentView.prototype.modalSelector = '.hub-modal';

InstagramModalContentView.prototype._render = function () {
    var renderOpts = {render: true};

    this._nativeView.$el.find('.fyr-loader').css({display: 'block'});
    this._nativeView.load();

    var content = this.opts.content;
    var productOpts = this.opts.productOptions;
    var productsVisible = productOpts.show && productOpts.showCallout && content.hasProducts();
    var rightsGranted = productOpts.requireRights ? this.opts.content.hasRightsGranted() : true;

    if ((productsVisible && rightsGranted) || (this.opts.showCTA && content.hasCTAs())) {
        this.opts.parentEl = this.el;
        this.opts.position = Popover.POSITIONS.RIGHT;
        this._productCTACalloutView = this.opts.productCTACalloutView || new ProductCTACalloutView(this.opts);
        this.add(this._productCTACalloutView, renderOpts);
    }
};

/** @override */
InstagramModalContentView.prototype.render = function () {
    CompositeView.prototype.render.call(this);

    this.$el.closest(this.modalSelector).addClass('instagram-content');
    var attachment = this.opts.content.attachments[0];

    this._nativeView = new InstagramNativeView($.extend({
        autoload: !this.willShowMask(attachment, true)
    }, this.opts));
    this.add(this._nativeView, {render: true});

    this.renderMediaMask(attachment, true, this._render.bind(this), this.$el);
    return this;
};

module.exports = InstagramModalContentView;
