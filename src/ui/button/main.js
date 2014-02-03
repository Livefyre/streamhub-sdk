'use strict';

var inherits = require('inherits');
var View = require('view');

/**
 * A View that, when clicked, executes a Command
 */
function Button (command, opts) {
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

Button.prototype.elClass += ' lf-btn';

/**
 * The CSS Class to put on this.$el when the command is
 * not allowed to be executed
 */
Button.prototype.disabledClass = 'disabled';

/**
 * Execute the button's command
 * @protected
 */
Button.prototype._execute = function _execute() {
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
