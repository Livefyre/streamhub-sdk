var $ = require('streamhub-sdk/jquery');
var get = require('mout/object/get');
var i18n = require('streamhub-sdk/i18n');
var inherits = require('inherits');
var ProductBlockView = require('streamhub-sdk/content/views/product-block-view');
var template = require('hgn!streamhub-sdk/content/templates/product-carousel');
var View = require('view');

'use strict';

/**
 * A version of the tiled attachement list view that only shows a single image
 * @param opts {Object} A set of options to config the view with
 * @param opts.el {HTMLElement} The element in which to render the streamed content
 * @param opts.content {Content} The content instance with which to display its attachments
 * @fires TiledAttachmentListView#focusContent.hub
 * @exports streamhub-sdk/views/ProductCarouselView
 * @constructor
 */
var ProductCarouselView = function (opts) {
    opts = opts || {};

    /**
     * Max number of cards to show in the view.
     * @type {number}
     */
    this.cardsInView = opts.cardsInView || 3;

    /**
     * List of products to show in the carousel.
     * @type {Array.<Object>}
     */
    this.products = get(opts, 'content.links.product') || [];

    /**
     * Left-most index within `this.products` of products that are currently
     * displayed within the carousel.
     * @type {number}
     */
    this.visibleIndex = 0;

    View.call(this, opts);
};
inherits(ProductCarouselView, View);

ProductCarouselView.prototype.template = template;
ProductCarouselView.prototype.elTag = 'section';
ProductCarouselView.prototype.elClass = 'product-carousel';
ProductCarouselView.prototype.hideClass = 'product-carousel-nav-hide';
ProductCarouselView.prototype.sizePrefixClass = 'product-carousel-size-';
ProductCarouselView.prototype.bodySelector = '.product-carousel-body';
ProductCarouselView.prototype.leftSelector = '.product-carousel-left';
ProductCarouselView.prototype.rightSelector = '.product-carousel-right';

ProductCarouselView.prototype.events = View.prototype.events.extended({}, function (events) {
    function handleClick(dir, e) {
        e.stopPropagation();
        this.navigate(dir);
    }
    events['click ' + this.leftSelector] = handleClick.bind(this, -1);
    events['click ' + this.rightSelector] = handleClick.bind(this, 1);
});

/**
 * Add provided product `view` to the DOM. The `pos` argument determines how
 * the product will be added: prepend or append.
 * @param {ProductBlockView} view
 * @param {number} pos
 */
ProductCarouselView.prototype.addViewToDOM = function (view, pos) {
    var parentEl = this.$el.find(this.bodySelector);

    if (pos < 0) {
        parentEl.prepend(view.el);
    } else {
        parentEl.append(view.el);
    }
    view.render();
};

/**
 * Creates a product view from a provided `product` object.
 * @param {Object} product
 * @return {ProductBlockView}
 */
ProductCarouselView.prototype.createProductView = function (product) {
    return new ProductBlockView({
        content: this.opts.content,
        product: product,
        productOptions: this.opts.productOptions
    });
};

/** @override */
ProductCarouselView.prototype.getTemplateContext = function () {
    var context = $.extend({}, this.opts);
    var productCarouselTitleText = i18n.get('productCarouselTitleText', 'Shop these products:').trim();
    context.productCarouselTitleText = productCarouselTitleText;
    context.productCarouselTitleShow = productCarouselTitleText.length > 0;
    return context;
};

/**
 * Determines if there are more products to show in the specified direction.
 * @param {string} dir
 * @return {boolean}
 */
ProductCarouselView.prototype.hasMore = function (dir) {
    if (dir === 'left') {
        return this.visibleIndex > 0;
    }
    // Visible index is index of left most item being shown. Cards in view tells
    // how many cards can be shown at any given time. So if we're showing 2
    // cards, the visible cards are indexes 0 and 1.
    return this.products.length - 1 > this.visibleIndex + this.cardsInView - 1;
};

/**
 * Navigate the carousel to show another item. If the `dir` argument is less
 * than 0, go left, otherwise, go right. This manages addition and removal of
 * child views into the DOM.
 * @param {number} dir
 */
ProductCarouselView.prototype.navigate = function (dir) {
    var lessThanZero = this.visibleIndex + dir < 0;
    var endOfProducts = this.products.length <= this.visibleIndex + dir + this.cardsInView - 1;

    // If the new visible index will be less than 0, or the last visible item
    // will be out of the products list range, do nothing.
    if (lessThanZero || endOfProducts) {
        return;
    }

    this.visibleIndex += dir;

    var children = this.$el.find(this.bodySelector).children();
    var idx = this.visibleIndex;

    if (dir < 0) {
        $(children[children.length - 1]).detach();
    } else {
        $(children[0]).detach();
        idx += this.cardsInView - 1;
    }

    this.addViewToDOM(this.createProductView(this.products[idx]), dir);
    this.updateNavigationButtons();
};

/** @override */
ProductCarouselView.prototype.render = function (view, opts) {
    this.$el.addClass(this.sizePrefixClass + this.cardsInView);
    this.$el.html(this.template(this.getTemplateContext()));
    this.updateNavigationButtons();

    // No products, nothing to do.
    if (!this.products || !this.products.length) {
        return this;
    }

    var numProducts = this.products.length;
    var cardsToShow = this.cardsInView > numProducts ? numProducts : this.cardsInView;
    cardsToShow += this.visibleIndex;

    for (var i = this.visibleIndex; i < cardsToShow; i++) {
        this.addViewToDOM(this.createProductView(this.products[i]), 1);
    }

    return this;
};

/**
 * Updates the visibility of the navigation buttons based on whether there are
 * more available to the right or left of the current visible set.
 */
ProductCarouselView.prototype.updateNavigationButtons = function () {
    this.$el.find(this.leftSelector).toggleClass(this.hideClass, !this.hasMore('left'));
    this.$el.find(this.rightSelector).toggleClass(this.hideClass, !this.hasMore('right'));
};

module.exports = ProductCarouselView;
