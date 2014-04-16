'use strict';

var EventEmitter = require('event-emitter');
var inherits = require('inherits');

/**
 * Does work
 * @constructor
 * @param fn {function} The work to do
 * @param [opts] {Object}
 * @param [opts.enable] {boolean} Set false to disable this command be default.
 */
function Command (fn, opts) {
    opts = opts || {};
    if (!fn) {
        throw 'A function needs to be specified to construct a Command';
    }

    // Allow for passing another command as fn
    if (fn instanceof Command) {
        var fnCommand = fn;
        fn = function () {
            fnCommand.execute.apply(fnCommand, arguments);
        }.bind(this);
    }

    this._execute = fn;
    this._canExecute = (opts.enable !== false) ? true : false;
    EventEmitter.call(this);
}
inherits(Command, EventEmitter);

/**
 * Execute the Command
 */
Command.prototype.execute = function (errback) {
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
    this._emitChangeCanExecute();
};

/**
 * Emits a change of whether the Command can be executed
 * @protected
 */
Command.prototype._emitChangeCanExecute = function () {
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
