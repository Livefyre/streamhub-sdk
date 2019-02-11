var inherits = require('inherits');
var template = require('hgn!streamhub-sdk/content/templates/call-to-action');
var View = require('view');

/**
 * View for individual Call-To-Action button.
 * @constructor
 * @extends (View)
 * @param {Object} cta
 */
function CallToActionView(cta) {
    this.cta = cta;
    View.call(this);
}
inherits(CallToActionView, View);

CallToActionView.prototype.elClass = 'call-to-action';
CallToActionView.prototype.elTag = 'a';
CallToActionView.prototype.template = template;

/** @override */
CallToActionView.prototype.getTemplateContext = function () {
    console.log(this.cta);
    return this.cta;
};

/** @override */
CallToActionView.prototype.render = function () {
    View.prototype.render.call(this);
    return this;
};

/** @override */
CallToActionView.prototype.setElement = function (element) {
    View.prototype.setElement.call(this, element);

    this.el.href = this.cta.url;
    this.el.target = '_blank';

    if (this.cta.buttonColor) {
        this.el.style.backgroundColor = this.cta.buttonColor;
    }
    if (this.cta.textColor) {
        this.el.style.color = this.cta.textColor;
    }
};

module.exports = CallToActionView;
