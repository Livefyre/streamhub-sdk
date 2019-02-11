var $ = require('streamhub-sdk/jquery');
var CallToActionStackView = require('streamhub-sdk/content/views/call-to-action-stack-view');
var get = require('mout/object/get');
var i18n = require('streamhub-sdk/i18n');
var inherits = require('inherits');
var Popover = require('streamhub-ui/popover');
var ProductCarouselView = require('streamhub-sdk/content/views/product-carousel-view');
var template = require('hgn!streamhub-sdk/content/templates/product-cta-callout-view');
var userAgent = require('streamhub-ui/util/user-agent');
var View = require('view');

'use strict';

function ProductCTACalloutView(opts) {
    if (!opts.hasOwnProperty('popoverEnabled')) {
        opts.popoverEnabled = true;
    }
    opts.dataAttr = opts.dataAttr || {};
    View.call(this, opts);

    this.ctaType = opts.content.hasProducts() ? TYPES.PRODUCT : TYPES.CTA;
    this._isMobile = userAgent.isMobile();
}
inherits(ProductCTACalloutView, View);

var TYPES = {
    CTA: 'cta',
    PRODUCT: 'product'
};

ProductCTACalloutView.prototype.template = template;
ProductCTACalloutView.prototype.elClass = 'product-cta-callout';
ProductCTACalloutView.prototype.popoverDivClass = 'popover-div';

ProductCTACalloutView.prototype.getTemplateContext = function () {
    var indicationText = this.ctaType === TYPES.PRODUCT ?
        i18n.get('productIndicationText', 'Shop').trim() :
        i18n.get('ctaIndicationText', '&hellip;').trim();
    return {
        indicationText: indicationText,
        indicationShow: indicationText.length > 0,
        type: this.ctaType
    };
};

/**
 * Create a popover that renders either a product carousel or call to action
 * stack view based on the links within the content.
 */
ProductCTACalloutView.prototype.createPopover = function () {
    if (this.popover) {
        this.$popoverContainer.append(this.popover.el);
        this.sizeAndPosition();
        return;
    }

    var popupContent;
    if (this.ctaType === TYPES.PRODUCT) {
        popupContent = new ProductCarouselView($.extend({cardsInView: 2}, this.opts));
    } else {
        popupContent = new CallToActionStackView($.extend({
            ctas: get(this, 'opts.content.links.cta') || []
        }, this.opts));
    }

    var parentEl = this.opts.parentEl || document.body;
    this.$popoverContainer = $(document.createElement('div'));
    this.$popoverContainer.attr('id', this.popoverDivClass);
    this.$popoverContainer.attr(this.opts.dataAttr);
    var $childEl = $(document.createElement('div'));
    this.$popoverContainer.append($childEl);
    this.$popoverContainer.appendTo(parentEl);

    this.popover = new Popover({
        el: $childEl,
        parentEl: parentEl
    });

    this.popover.$el.addClass('lf-' + this.ctaType + '-popover');
    this.popover._position = this.opts.position || Popover.POSITIONS.SMART_TOP;
    this.popover.setContentNode(popupContent.render().el);

    this.sizeAndPosition();

    this._isMobile || this.popover.$el.on('mouseleave', function () {
        $(this).detach();
    });
};

ProductCTACalloutView.prototype.setNewOpts = function (newOpts) {
    var opts = newOpts;
    opts.el = this.opts.el;
    opts.dataAttr = this.opts.dataAttr;
    opts.popoverEnabled = this.opts.hasOwnProperty('popoverEnabled') ? this.opts.popoverEnabled : true;
};

ProductCTACalloutView.prototype.render = function () {
    View.prototype.render.call(this);
    return this;
};

ProductCTACalloutView.prototype.sizeAndPosition = function () {
    var parentEl = this.el.parentElement;
    var shopBtn = this.el.children[0];

    if (parentEl.offsetWidth === this.el.offsetWidth) {
        this.popover.resizeAndReposition(shopBtn);
        this.popover.setProductPopoverWidth(shopBtn);
        this.popover.positionArrowSmart(shopBtn);
        return;
    }

    this.popover.resizeAndReposition(shopBtn);
    this.popover.setProductPopoverWidth(this.el);
    this.popover.positionArrowSmart(shopBtn);
};

ProductCTACalloutView.prototype.events = View.prototype.events.extended({
    'click .popover-callout-button': function () {
        if (!this.opts.popoverEnabled || !this._isMobile) {
            return;
        }
        if (this.popover && this.popover.$el.parent().length) {
            return this.popover.$el.detach();
        }
        this.createPopover();
    },
    'mouseover .popover-callout-button': function () {
        !this._isMobile && this.opts.popoverEnabled && this.createPopover();
    },
    'mouseleave': function (e) {
        if (!this.popover || this._isMobile) {
            return;
        }

        var tOut = setTimeout(function () {
            this.popover.$el.detach();
        }.bind(this), 100);

        $(this.popover.$el).mouseover(function () { clearTimeout(tOut); });
    }
});

module.exports = ProductCTACalloutView;
