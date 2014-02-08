'use strict';

var Button = require('streamhub-sdk/ui/button');
var Command = require('streamhub-sdk/ui/command');
var inherits = require('inherits');

function HubButton (fnOrCommand, opts) {
    opts = opts || {};
    opts.elClassPrefix = opts.elClassPrefix || '';
    opts.elClassPrefix += ' hub';

    var command;
    if (typeof(fnOrCommand) === 'function') {
        command = new Command(fnOrCommand);
    } else if (fnOrCommand) {
        command = fnOrCommand;
    }
    Button.call(this, command, opts);
};
inherits(HubButton, Button);

module.exports = HubButton;
