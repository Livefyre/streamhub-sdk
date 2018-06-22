var $ = require('streamhub-sdk/jquery');
var actionTemplate = require('hgn!streamhub-sdk/content/templates/call-to-action');
var debug = require('debug');
var get = require('mout/object/get');
var inherits = require('inherits');
var template = require('hgn!streamhub-sdk/content/templates/call-to-action-bar');
var util = require('streamhub-sdk/util');
var View = require('streamhub-sdk/view');

'use strict';

var TOTAL_BAR_MARGIN = 40;
var SPACE_BETWEEN_CTAS = 7;
var ADDITIONAL_CTA_WIDTH = 36;
var CTA_WIDTH = 125;
var EFFECTIVE_CTA_WIDTH = CTA_WIDTH + SPACE_BETWEEN_CTAS;

/**
 * A view that displays a content item's header.
 * Includes the avatar, content byline, and source-type logo
 * @param opts {Object} A set of options to config the view with
 * @param opts.el {HTMLElement} The element in which to render the streamed content
 * @param opts.content {Content} The content instance with which to display its header
 * @exports streamhub-sdk/views/content-header-view
 * @constructor
 */
var CallToActionBar = function (opts) {
    opts = opts || {};
    View.call(this, opts);
    window.addEventListener('resize', this.render.bind(this));
};
inherits(CallToActionBar, View);

CallToActionBar.prototype.template = template;
CallToActionBar.prototype.elTag = 'section';
CallToActionBar.prototype.elClass = 'call-to-action-bar';
CallToActionBar.prototype.showClass = 'show';
CallToActionBar.prototype.popoverSelector = '.call-to-action-popover';
CallToActionBar.prototype.buttonIconSelector = '.button-icon';
CallToActionBar.prototype.buttonSelector = '.additional-call-to-action-button';
CallToActionBar.prototype.buttonClosedClass = 'closed';
CallToActionBar.prototype.buttonOpenClass = 'open';
CallToActionBar.prototype.contentAttr = 'data-content-id';
CallToActionBar.prototype.insightsVerb = 'CustomCtaButtonClick';

CallToActionBar.prototype.events = View.prototype.events.extended({}, function (events) {
    events['click ' + this.buttonSelector] = this.onButtonClick.bind(this);
    events['keyup ' + this.buttonSelector] = this.onButtonClick.bind(this);
    events['keyup a'] = this.onAnchorKeyUp.bind(this);
});

CallToActionBar.prototype.render = function () {
    if (!this.opts.showCTA || !(get(this, 'opts.content.links.cta') || []).length) {
        return;
    }

    View.prototype.render.call(this);
};

CallToActionBar.prototype.onButtonClick = function (e) {
    if (!e.keyCode || e.keyCode === 13 || e.keyCode === 32) {
        this.togglePopover();
    }
};

CallToActionBar.prototype.onAnchorKeyUp = function (e) {
    if (e.keyCode === 13 || e.keyCode === 32) {
        this.$el.trigger('insights:local', { type: this.insightsVerb });
    }
};

CallToActionBar.prototype.togglePopover = function () {
    this.$el.find(this.popoverSelector).toggleClass(this.showClass);
    this.$el.find(this.buttonIconSelector).toggleClass([this.buttonOpenClass, this.buttonClosedClass].join(' '));
}

CallToActionBar.prototype.getTemplateContext = function () {
    var additionalContext = {};

    additionalContext.ctas = this.opts.content.links.cta.slice();

    var parentContentCardEl = this.el.parentElement || document.querySelector('[data-content-id="' + this.opts.content.id + '"]');
    var numOfCtas = additionalContext.ctas.length;

    if (parentContentCardEl) {
        var totalWidth = parentContentCardEl.offsetWidth;
        var usableWidth = totalWidth - TOTAL_BAR_MARGIN;
        var usableSlots = Math.floor(usableWidth / EFFECTIVE_CTA_WIDTH);

        additionalContext.additionalCTAs = false;

        var usedSlots = usableSlots >= numOfCtas ? numOfCtas : usableSlots;
        var unusedSlots = usableSlots - usedSlots;

        if (numOfCtas > usableSlots) {
            var extraSpaceAfterCtasAdded = usableWidth - ((usedSlots * EFFECTIVE_CTA_WIDTH));
            if (extraSpaceAfterCtasAdded < ADDITIONAL_CTA_WIDTH) {
                usedSlots -= 1;
            }
            additionalContext.additionalCTAs = true;
            additionalContext.width = (usedSlots * EFFECTIVE_CTA_WIDTH) + ADDITIONAL_CTA_WIDTH;
        } else {
            additionalContext.width = (usedSlots * EFFECTIVE_CTA_WIDTH) - SPACE_BETWEEN_CTAS;
        }

        additionalContext.mainCTAs = additionalContext.ctas.splice(0, usedSlots);
    }

    return additionalContext;
};

CallToActionBar.prototype.destroy = function () {
    View.prototype.destroy.call(this);
    window.removeEventListener('resize', this.render.bind(this));
};

module.exports = CallToActionBar;
