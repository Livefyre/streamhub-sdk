'use strict';

var ButtonTemplate = require('hgn!streamhub-sdk/ui/button/templates/button');
var inherits = require('inherits');
var View = require('view');

/**
 * A View that, when clicked, executes a Command
 */
function Button (command, opts) {
    opts = opts || {};
    if (opts.elClassPrefix) {
        this.elClassPrefix = opts.elClassPrefix;
    }
    if (this.elClassPrefix) {
        this.elClass = this.elClassPrefix + '-' + this.elClass;
    }
    if (opts.className) {
        this.elClass += ' '+opts.className;
    }
    this._label = opts.label || '';

    View.call(this, opts);

    if (command) {
        this._setCommand(command);
    }
}
inherits(Button, View);

// DOM Event Listeners
Button.prototype.events = {
    click: '_execute'
};

Button.prototype.elClassPrefix = 'lf';
Button.prototype.elClass += 'btn';
Button.prototype.template = ButtonTemplate;

/**
 * The CSS Class to put on this.$el when the command is
 * not allowed to be executed
 */
Button.prototype.disabledClass = 'disabled';

Button.prototype.render = function () {
    View.prototype.render.call(this);
};

Button.prototype.getTemplateContext = function () {
    var context = {};
    context.buttonLabel = this._label;

    return context;
};

/**
 * Execute the button's command
 * @protected
 */
Button.prototype._execute = function _execute() {
    // TODO: Don't execute if not enabled
    this._command.execute();
};

/**
 * Set the Command that the Button executes.
 * Only intended to be called once
 * @protected
 * @param command {Command}
 */
Button.prototype._setCommand = function (command) {
    var self = this;
    this._command = command;
    this._setEnabled(this._command.canExecute());
    this._command.on('change:canExecute', function (canExecute) {
        self._setEnabled(canExecute);
    });
};

/**
 * Set whether the Button is enabled or not
 * @protected
 * @param {boolean} isEnabled - Whether the button should be enabled
 */
Button.prototype._setEnabled = function (isEnabled) {
    this.$el.toggleClass(this.disabledClass, ! isEnabled);
};

module.exports = Button;
