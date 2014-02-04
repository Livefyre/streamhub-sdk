'use strict';

var Button = require('streamhub-sdk/ui/button');
var inherits = require('inherits');

function HubButton (command, opts) {
    opts.elClassPrefix = 'hub';
    Button.call(this, command, opts);
};
inherits(HubButton, Button);

module.exports = HubButton;
