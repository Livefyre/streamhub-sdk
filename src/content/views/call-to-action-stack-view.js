var CallToActionView = require('streamhub-sdk/content/views/call-to-action-view');
var CompositeView = require('view/composite-view');
var inherits = require('inherits');

/**
 * Stack view of Call-To-Action views.
 * @constructor
 * @extends {CompositeView}
 * @param {Object} opts
 */
function CallToActionStackView(opts) {
    CompositeView.call(this, opts);
}
inherits(CallToActionStackView, CompositeView);

CallToActionStackView.prototype.elClass = 'call-to-action-stack';

/** @override */
CallToActionStackView.prototype.render = function () {
    CompositeView.prototype.render.call(this);

    // Creates CTA views instances and adds them as children to the view.
    this.opts.ctas.forEach(function (cta) {
      this.add(new CallToActionView(cta), {render: true});
    }.bind(this));

    return this;
}

module.exports = CallToActionStackView;
