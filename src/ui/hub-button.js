'use strict';

var Button = require('streamhub-sdk/ui/button');
var Command = require('streamhub-sdk/ui/command');
var inherits = require('inherits');

function HubButton (fnOrCommand, opts) {
    opts = opts || {};
    opts.elClassPrefix = opts.elClassPrefix || '';
    opts.elClassPrefix += ' hub';

    this._buttonUrl = opts.buttonUrl;
    if (this._buttonUrl) {
        fnOrCommand = function () {};
    }

    var command;
    if (typeof(fnOrCommand) === 'function') {
        command = new Command(fnOrCommand);
    } else if (fnOrCommand) {
        command = fnOrCommand;
    }
    Button.call(this, command, opts);
}
inherits(HubButton, Button);

HubButton.prototype.getTemplateContext = function () {
    var context = Button.prototype.getTemplateContext.call(this);
    context.buttonUrl = this._buttonUrl;

    return context;
};

module.exports = HubButton;
