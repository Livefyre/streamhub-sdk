var $ = require('streamhub-sdk/jquery');
var asLivefyreContentView = require('streamhub-sdk/content/views/mixins/livefyre-content-view-mixin');
var asMediaMaskMixin = require('streamhub-sdk/content/views/mixins/media-mask-mixin');
var asTwitterContentView = require('streamhub-sdk/content/views/mixins/twitter-content-view-mixin');
var CompositeView = require('view/composite-view');
var ContentBodyView = require('streamhub-sdk/content/views/spectrum/content-body-view');
var ContentFooterView = require('streamhub-sdk/content/views/spectrum/content-footer-view');
var ContentHeaderView = require('streamhub-sdk/content/views/spectrum/content-header-view');
var ContentHeaderViewFactory = require('streamhub-sdk/content/content-header-view-factory');
var ContentViewFactory = require('streamhub-sdk/content/content-view-factory');
var CTABarView = require('streamhub-sdk/content/views/call-to-action-bar-view');
var debug = require('debug');
var get = require('mout/object/get');
var inherits = require('inherits');
var ProductCarouselView = require('streamhub-sdk/content/views/product-carousel-view');
var util = require('streamhub-sdk/util');

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
 * @fires ProductContentView#removeProductContentView.hub
 * @exports streamhub-sdk/content/views/content-view
 * @constructor
 */
var ProductContentView = function (opts) {
    opts = opts || {};

    this.content = opts.content;
    this.createdAt = new Date(); // store construction time to use for ordering if this.content has no dates
    this._headerViewFactory = opts.headerViewFactory || new ContentHeaderViewFactory();
    this._contentViewFactory = new ContentViewFactory();

    CompositeView.call(this, opts);

    this._addInitialChildViews(opts);
    this._applyMixin(opts);
    asMediaMaskMixin(this, opts);

    if (this.content) {
        this.content.on("change:body", function (newVal, oldVal) {
            this._handleBodyChange();
        }.bind(this));
    }
};
inherits(ProductContentView, CompositeView);

ProductContentView.prototype.elTag = 'article';
ProductContentView.prototype.elClass = 'content';
ProductContentView.prototype.invalidClass = 'content-invalid';
ProductContentView.prototype.spectrumClass = 'spectrum-content';
ProductContentView.prototype.attachmentsElSelector = '.content-attachments';
ProductContentView.prototype.attachmentFrameElSelector = '.content-attachment-frame';
ProductContentView.prototype.modalSelector = '.hub-modal';

/**
 * @param {Object} opts
 * @param {boolean=} shouldRender
 */
ProductContentView.prototype._addInitialChildViews = function (opts, shouldRender) {
    var renderOpts = {render: !!shouldRender};

    if (!opts.isInstagram) {
        this._headerView = opts.headerView || new ContentHeaderView(
            this._headerViewFactory.getHeaderViewOptsForContent(opts.content));
        this.add(this._headerView, renderOpts);

        this._bodyView = opts.bodyView || new ContentBodyView({
            content: opts.content,
            showMoreEnabled: true
        });
        this.add(this._bodyView, renderOpts);
    }

    this._footerView = opts.footerView || new ContentFooterView(opts);
    this.add(this._footerView, renderOpts);

    var rightsGranted = opts.productOptions.requireRights ? opts.content.hasRightsGranted() : true;
    if (rightsGranted && opts.productOptions.show && opts.content.hasProducts()) {
        this._productView = opts.productView || new ProductCarouselView(opts);
        this.add(this._productView, renderOpts);
    }

    // There should only be products OR CTAs, but check just in case to avoid display issues for weird / bad data
    if (!this._productCarouselView && (get(this, 'content.links.cta') || []).length) {
        this._ctaView = opts.ctaView || new CTABarView(opts);
    }
};

ProductContentView.prototype._applyMixin = function (opts) {
    var mixin = this._contentViewFactory.getMixinForTypeOfContent(this.content, {
        hideSocialBrandingWithRights: opts.hideSocialBrandingWithRights
    });
    mixin(this, opts);
    // If the assigned mixin was either Livefyre or Twitter, no need to continue
    // since those are the two base mixins.
    if ([asLivefyreContentView, asTwitterContentView].indexOf(mixin) > -1) {
        return;
    }
    // All other social provider mixins should also have the Livefyre mixin
    // applied because that is what adds additional functionality such as the
    // footer buttons.
    asLivefyreContentView(this, opts);
};

ProductContentView.prototype._removeInitialChildViews = function () {
    this._headerView && this.remove(this._headerView);
    this._bodyView && this.remove(this._bodyView);
    this._footerView && this.remove(this._footerView);
    this._productView && this.remove(this._productView);
};

/**
 * Set the .el DOMElement that the ProductContentView should render to
 * @param el {DOMElement} The new element the ProductContentView should render to
 * @returns {ProductContentView}
 */
ProductContentView.prototype.setElement = function (el) {
    CompositeView.prototype.setElement.apply(this, arguments);

    if (this.content && this.content.id) {
        this.$el.attr('data-content-id', this.content.id);
    }

    this.$el.addClass(this.spectrumClass);
    return this;
};

/**
 * Gets the template rendering context. By default, returns "this.content".
 * @returns {Content} The content object this view was instantiated with.
 */
ProductContentView.prototype.getTemplateContext = function () {
    return $.extend({}, this.content);
};

/**
 * Removes the content view element, and triggers 'removeProductContentView.hub'
 * event for the instance to be removed from its associated ListView.
 */
ProductContentView.prototype.remove = function () {
    /**
     * removeProductContentView.hub
     * @event ProductContentView#removeProductContentView.hub
     * @type {{ProductContentView: ProductContentView}}
     */
    this.$el.trigger('removeProductContentView.hub', {ProductContentView: this});
    this.$el.detach();
};

ProductContentView.prototype._handleBodyChange = function (newVal, oldVal) {
    this._bodyView && this._bodyView.render();
};

ProductContentView.prototype.destroy = function () {
    CompositeView.prototype.destroy.call(this);
    this.content = null;
};

/**
 * Render the content inside of the ProductContentView's element.
 * @returns {ProductContentView}
 */
ProductContentView.prototype.render = function () {
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
    if (this._footerView && this._testHasInnerHtmlBug()) {
        this._footerView._detachButtons();
    }

    CompositeView.prototype.render.call(this);

    if (this.opts.isInstagram) {
        this.$el.closest(this.modalSelector).addClass('instagram-content');
        this.el.insertAdjacentHTML('afterbegin', this.content.attachments[0].html);

        var placeholder = this.$el.find('blockquote');
        this.renderMediaMask(this.opts.content.attachments[0], true, function () {
            if (!window.instgrm) {
                var script = document.createElement('script');
                script.src = '//instagram.com/embed.js';
                this.el.append(script);
            } else {
                window.instgrm.Embeds.process();
            }

            if (this.iframeInterval) {
                clearInterval(this.iframeInterval);
            }
            setInterval(this.removeIframeStyles.bind(this), 500);

        }.bind(this), placeholder);
    }

    var self = this;
    setTimeout(function () {
        util.raf(function () {
            if (!self._productView) {
                return;
            }
            var productHeight = self._productView.$el.height() + 20;
            if (productHeight) {
                self.$el.css('paddingBottom', productHeight + 'px');
            }
        });
    }, 0);

    return this;
};

ProductContentView.prototype.removeIframeStyles = function () {
    var iframe = this.$el.find('iframe');
    if (iframe.length > 0) {
        iframe.removeAttr('style');
    }
    clearInterval(this.iframeInterval);
};

ProductContentView.prototype.onInsert = function () {
    if (this._ctaView) {
        this._ctaView.opts = this.opts;
        this._ctaView.setParent(this.el);
        this._ctaView.render();
        this.el.appendChild(this._ctaView.el);
    }
};

ProductContentView.prototype._testHasInnerHtmlBug = function () {
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
};

module.exports = ProductContentView;
