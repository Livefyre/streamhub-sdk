var Auth = require('streamhub-sdk/auth');
var Command = require('streamhub-sdk/ui/command');
var inherits = require('inherits');
var log = require('streamhub-sdk/debug')
        ('streamhub-sdk/ui/command/auth-required-command');
var util = require('streamhub-sdk/util');

'use strict';

/**
 * Wraps a command and only allows that command to be called if the user is
 * authenticated. If the user isn't authenticated and the developer provides
 * an authentication command, then the authentication command will be executed.
 * @param [command] {Command} Option function to replace the default function.
 * @param [opts] {Object}
 * @param [opts.authCmd] {Command} Command called to authenticate a user who
 *      hasn't already authenticated.
 * @param [opts.disable] {boolean} Set to disable this command on construction.
 * @constructor
 * @extends {Command}
 */
var AuthRequiredCommand = function (command, opts) {
    opts = opts || {};
    Command.call(this, executeFn, opts);
    
    this._command = command;
    this._command.on('change:canExecute', this._handleCanExecuteChange);
    
    this._authCmd.on('change:canExecute', this._handleCanExecuteChange);
    if (opts.authCmd) {
        this.setAuthCommand(opts.authCmd);
    }
    
    if (opts.disable) {
        this.disable();
    };
    
    var self = this;
    function executeFn () {
        self._command.execute();
    }
    
    //Emit potential canExecute change whenever token is set
    Auth.on('token', this._emitChange);
};
inherits(AuthRequiredCommand, Command);

/**
 * Execute the Command
 * @override
 */
AuthRequiredCommand.prototype.execute = function () {
    if (this.canExecute()) {
        if (!Auth.getToken()) {
            this._authenticate(authRequiredCallback);
        } else {
            authRequiredCallback.apply(this, arguments);
        }
    }
    
    var self = this;
    /**
     * This callback executes this command, wrapped so that it can be passed
     * to an authenticating command to be called after authentication.
     */
    function authRequiredCallback() {
        Auth.getToken() && Command.prototype.execute.apply(self, arguments);
    }
};

/**
 * Check whether the Command can be executed.
 * 
 * return | _command.canExecute() | Auth.getToken() | _authCmd.canExecute()
 * -------|-----------------------|-----------------|----------------------
 *  false |         false         |                 |
 *  true  |         true          |     truthy      |
 *  false |         true          |     falsy       |      false
 *  true  |         true          |     falsy       |      true
 * ------------------------------------------------------------------------
 * @returns {!boolean}
 */
AuthRequiredCommand.prototype.canExecute = function () {
    if (!this._command.canExecute()) {
        return false;
    }
    
    if (Auth.getToken()) {
        return true;
    }
    
    return this._authCmd.canExecute();
};

/**
 * Change whether the Command can be executed
 * @protected
 * @param canExecute {!boolean}
 * @override
 */
AuthRequiredCommand.prototype._changeCanExecute = function (canExecute) {
    this._command._canExecute(canExecute);
};

/**
 * Enable the Command
 * @override
 */
Command.prototype.enable = function () {
    this._command._changeCanExecute(true);
};

/**
 * Disable the Command, discouraging its Execution
 * @override
 */
Command.prototype.disable = function () {
    this._command._changeCanExecute(false);
};

/**
 * Command used to initiate an authentication view or process.
 * Default is a disabled command with a function that logs it invocation.
 * @type {!Command}
 */
AuthRequiredCommand.prototype._authCmd = (
    /** @returns {!Command} */
        function () {
    var cmd = new Command(function () {
        log('Default authentication command executed.');
    });
    cmd.disable();
    return cmd;
})();

/**
 * Replaces the current authentication command with the new command.
 * @param cmd {!Command}
 */
AuthRequiredCommand.prototype.setAuthCommand = function (cmd) {
    this._authCmd.removeListener('change:canExecute', this._emitChange);
    this._authCmd = cmd;
    this._authCmd.on('change:canExecute', this._handleCanExecuteChange);
};

/**
 * Handles changes in canExecute() from referenced commands.
 */
AuthRequiredCommand.prototype._handleCanExecuteChange = function () {
    //TODO (joao) Make this smart and only emitChange when it has changed for 'this'
    this._emitChange();
};

/**
 * This is the listener placed on this._authCmd for 'change:canExecute' and Auth
 * for 'token' to emit the possibility of a changed to canExecute for this command.
 * @protected
 */
AuthRequiredCommand.prototype._emitChange = (function () {
    var self = this;
    return function (v) {
        self.emit('change:canExecute', self.canExecute());
    };
})();

/**
 * Checks if this._authCmd can be executed, then executes it.
 * @param [callback] {function}
 * @protected
 */
AuthRequiredCommand.prototype._authenticate = function (callback) {
    if (!this._authCmd.canExecute()) {
        log('Attempt to _authenticate() thwarted by !_authCmd.canExecute()', this);
        return;
    }
    
    this._authCmd.execute.apply(this._authCmd, arguments);
};

/**
 * Prepares this command for trash collection.
 */
AuthRequiredCommand.prototype.destroy = function () {
    Auth.off('token', this._emitChange);
    this._authCmd.off('change:canExecute', this._emitChange);
    this._authCmd = null;
    this._command = null;
    this._execute = null;//Command
    this._listeners = null;//EventEmitter
};

module.exports = AuthRequiredCommand;
