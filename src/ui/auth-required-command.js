var Auth = require('streamhub-sdk/auth');
var Command = require('streamhub-sdk/ui/command');
var inherits = require('inherits');
var log = require('streamhub-sdk/debug')
        ('streamhub-sdk/ui/auth-required-command');
var util = require('streamhub-sdk/util');

'use strict';

/**
 * Wraps a command and only allows that command to be called if the user is
 * authenticated. If the user isn't authenticated and the developer provides
 * an authentication command, then the authentication command will be executed.
 * @param [command] {Command} Option function to replace the default function.
 * @param [opts] {Object}
 * @param [opts.authenticate] {function} Function that will authenticate a user,
 *      hasn't already authenticated, then call a provided callback
 * @constructor
 * @extends {Command}
 */
var AuthRequiredCommand = function (command, opts) {
    var self = this;
    opts = opts || {};
    command = command || function () {};
    Command.call(this, command, opts);
    if (opts.authenticate) {
        this._authenticate = opts.authenticate;
    }
};
inherits(AuthRequiredCommand, Command);

/**
 * Execute the Command
 * @override
 */
AuthRequiredCommand.prototype.execute = function () {
    var self = this;
    var authDelegate = Auth.getDelegate();
    var authUser = authDelegate && authDelegate.getUser();
    function isAuthenticated () {
        var authenticated = authUser ? authUser.isAuthenticated() : Auth.getToken();
        return authenticated;
    }

    /**
     * This callback executes this command, wrapped so that it can be passed
     * to an authenticating command to be called after authentication.
     */
    function doWorkWithAuth() {
        Command.prototype.execute.apply(self, arguments);
    }

    if (isAuthenticated()) {
        doWorkWithAuth();
    } else {
        this._authenticate(doWorkWithAuth);
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
    if ( ! Auth.getDelegate()) {
        return false;
    }
    return Command.prototype.canExecute.apply(this, arguments);
};

/**
 * Checks if this._authCmd can be executed, then executes it.
 * @param [callback] {function}
 * @protected
 */
AuthRequiredCommand.prototype._authenticate = function (callback) {
    var delegate = Auth.getDelegate();
    if ( ! delegate) {
        return false;
    }
    delegate.getUser().once('login', function () {
        callback();
    });
    delegate.login();
};

/**
 * Prepares this command for trash collection.
 */
AuthRequiredCommand.prototype.destroy = function () {
    this._listeners = null;//EventEmitter
};

module.exports = AuthRequiredCommand;
