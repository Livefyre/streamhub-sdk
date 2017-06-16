var ContentBodyView = require('streamhub-sdk/content/views/content-body-view');
var inherits = require('inherits');

function SpectrumContentBodyView(opts) {
    ContentBodyView.call(this, opts);
}
inherits(SpectrumContentBodyView, ContentBodyView);

/** @override */
SpectrumContentBodyView.prototype.events = ContentBodyView.prototype.events.extended({
    'click': function (e) {
        // Open the new content modal if the click event was on a non-anchor
        // element within the body.
        if (e.target.tagName !== 'A') {
            this.$el.parent().trigger('focusContent.hub', { content: this._content });
        }
    }
});

module.exports = SpectrumContentBodyView;
