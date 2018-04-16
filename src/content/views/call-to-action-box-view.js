var $ = require('streamhub-sdk/jquery');
var CTABarView = require('./call-to-action-bar-view');
var inherits = require('inherits');
var template = require('hgn!streamhub-sdk/content/templates/call-to-action-box');

'use strict';

var CallToActionBoxView = function (opts) {
  CTABarView.call(this, opts);
};
inherits(CallToActionBoxView, CTABarView);

CallToActionBoxView.prototype.elTag = 'div';
CallToActionBoxView.prototype.elClass = 'call-to-action-box';
CallToActionBoxView.prototype.template = template;
CallToActionBoxView.prototype.buttonSelector = '.call-to-action-more';

CallToActionBoxView.prototype.events = CTABarView.prototype.events.extended({}, function (events) {
  events['mouseover ' + this.buttonSelector] = this.showPopover.bind(this);
  events['mouseout ' + this.buttonSelector] = this.hidePopover.bind(this);
});

CallToActionBoxView.prototype.getTemplateContext = function () {
  return {
    ctas: this.opts.content.links.cta,
    additionalCTAs: this.opts.content.links.cta && this.opts.content.links.cta.length > 1
  };
};

CallToActionBoxView.prototype.showPopover = function () {
  var $popover = this.$el.find(this.popoverSelector);
  if (!$popover.hasClass(this.showClass)) {
    $popover.addClass(this.showClass);
  }
};

CallToActionBoxView.prototype.hidePopover = function () {
  this.$el.find(this.popoverSelector).removeClass(this.showClass);
};

module.exports = CallToActionBoxView;