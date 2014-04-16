var auth = require('auth');
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
    this._authCmd = command || new Command(function () {});
    Command.call(this, this._authCmd, opts);
    if (opts.authenticate) {
        this._authenticate = opts.authenticate;
    }

    auth.on('delegate', function () {
        if (auth.hasDelegate()) {
            self.enable();
        }
    });
};
inherits(AuthRequiredCommand, Command);

/**
 * Execute the Command
 * @override
 */
AuthRequiredCommand.prototype.execute = function () {
    var self = this;
    var executeArgs = arguments;

    function isAuthenticated () {
        return auth.get('livefyre');
    }

    /**
     * This callback executes this command, wrapped so that it can be passed
     * to an authenticating command to be called after authentication.
     */
    function doWorkWithAuth() {
        Command.prototype.execute.apply(self, arguments);
    }

    if (isAuthenticated()) {
        doWorkWithAuth.apply(self, executeArgs);
    } else {
        auth.login(function (err, user) {
            if (err) {
                this.emit('loginError.hub', err);
                return;
            }
            doWorkWithAuth.apply(self, executeArgs);
        });
    }
};

/**
 * Check whether the Command can be executed.
 * 
 * return | _command.canExecute() | auth.isAuthenticated() | _authCmd.canExecute()
 * -------|-----------------------|------------------------|----------------------
 *  false |         false         |                        |
 *  true  |         true          |     truthy             |
 *  false |         true          |     falsy              |      false
 *  true  |         true          |     falsy              |      true
 * -------------------------------------------------------------------------------
 * @returns {!boolean}
 */
AuthRequiredCommand.prototype.canExecute = function () {
    if (! auth.hasDelegate('login')) {
        return false;
    }
    return Command.prototype.canExecute.apply(this, arguments) && this._authCmd.canExecute();
};

/**
 * Prepares this command for trash collection.
 */
AuthRequiredCommand.prototype.destroy = function () {
    this._listeners = null;//EventEmitter
};

module.exports = AuthRequiredCommand;
