var ContentHeaderView = require('streamhub-sdk/content/views/content-header-view');
var inherits = require('inherits');
var template = require('hgn!streamhub-sdk/content/templates/spectrum/content-header');
var util = require('streamhub-sdk/util/date');

function SpectrumContentHeaderView(opts) {
    opts = opts || {};
    this.createdAt = opts.createdAt;
    this.createdAtUrl = opts.createdAtUrl;

    ContentHeaderView.call(this, opts);
}
inherits(SpectrumContentHeaderView, ContentHeaderView);

SpectrumContentHeaderView.prototype.template = template;

/** @override */
SpectrumContentHeaderView.prototype.getTemplateContext = function () {
    var context = ContentHeaderView.prototype.getTemplateContext.call(this);
    if (this.createdAt) {
        context.formattedCreatedAt = util.formatDate(this.createdAt);
        context.createdAtUrl = this.createdAtUrl;
    }
    return context;
};

module.exports = SpectrumContentHeaderView;
