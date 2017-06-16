var ContentFooterView = require('streamhub-sdk/content/views/content-footer-view');
var inherits = require('inherits');
var template = require('hgn!streamhub-sdk/content/templates/spectrum/content-footer');

function SpectrumContentFooterView(opts) {
    ContentFooterView.call(this, opts);
}
inherits(SpectrumContentFooterView, ContentFooterView);

SpectrumContentFooterView.prototype.template = template;

module.exports = SpectrumContentFooterView;
