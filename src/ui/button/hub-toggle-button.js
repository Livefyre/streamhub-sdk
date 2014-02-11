'use strict';

var HubButton = require('streamhub-sdk/ui/button/hub-button');
var inherits = require('inherits');

function HubToggleButton (fnOrCommand, opts) {
    opts = opts || {};
    opts.elClassPrefix = opts.elClassPrefix || '';
    this._on = opts.on || false;
    opts.elClassPrefix += this._on ? ' hub-btn-toggle-on' : 'hub-btn-toggle-off';

    HubButton.call(this, fnOrCommand, opts);
}
inherits(HubToggleButton, HubButton);

HubToggleButton.prototype._execute = function () {
    this._on = !this._on;
    HubButton.prototype._execute.call(this);
    this.$el.removeClass('hub-btn-toggle-on').removeClass('hub-btn-toggle-off');
    this._on ? this.$el.addClass('hub-btn-toggle-on') : this.$el.addClass('hub-btn-toggle-off');
};

HubToggleButton.prototype.getTemplateContext = function () {
    var context = HubButton.prototype.getTemplateContext.call(this);
    context.on = this._on;

    return context;
};

module.exports = HubToggleButton;
