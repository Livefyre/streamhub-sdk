'use strict';

var EventEmitter = require('event-emitter');
var inherits = require('inherits');

/**
 * Does work
 * @constructor
 * @param fn {function} The work to do
 * @param [opts] {Object}
 */
function Command (fn, opts) {
    this._execute = fn;
    this._canExecute = true;
    EventEmitter.call(this);
}
inherits(Command, EventEmitter);

/**
 * Execute the Command
 */
Command.prototype.execute = function () {
    this.canExecute() && this._execute.apply(this, arguments);
};

/**
 * Enable the Command
 */
Command.prototype.enable = function () {
    this._changeCanExecute(true);
};

/**
 * Disable the Command, discouraging its Execution
 */
Command.prototype.disable = function () {
    this._changeCanExecute(false);
};

/**
 * Change whether the Command can be executed
 * @protected
 * @param canExecute {!boolean}
 */
Command.prototype._changeCanExecute = function (canExecute) {
    this._canExecute = canExecute;
    this.emit('change:canExecute', this.canExecute());
};

/**
 * Check whether the Command can be executed
 * @returns {!boolean}
 */
Command.prototype.canExecute = function () {
    return this._canExecute;
};

module.exports = Command;
