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
  events['mouseleave ' + this.popoverSelector] = this.dismissAllPopovers.bind(this);
});

CallToActionBoxView.prototype.getTemplateContext = function () {
  return {
    ctas: this.opts.content.links.cta,
    additionalCTAs: this.opts.content.links.cta.length > 1
  };
};

CallToActionBoxView.prototype.showPopover = function (e) {
  this.dismissAllPopovers(e);
  var $popover = this.$el.find(this.popoverSelector);
  if (!$popover.hasClass(this.showClass)) {
    $popover.addClass(this.showClass);
  }
};

CallToActionBoxView.prototype.hidePopover = function () {
  this.$el.find(this.popoverSelector).removeClass(this.showClass);
};

module.exports = CallToActionBoxView;
