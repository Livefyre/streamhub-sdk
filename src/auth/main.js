define(['inherits', 'event-emitter', 'streamhub-sdk/debug'],
function (inherits, EventEmitter, debug) {
    'use strict';


	var log = debug('streamhub-sdk/auth');


	/**
	 * An object that knows about the authenticated user
	 */
	var Auth = new EventEmitter();


	/**
	 * Set the Auth token
	 * @param token {string} A Livefyre authentication token,
	 *     as described at http://bit.ly/17SYaoT
	 */
	Auth.setToken = function (token) {
		log('.setToken', token);
		this._token = token;
		this.emit('token', token);
	};


	/**
	 * Get the Auth token
	 * @return A token, if one has been set, else undefined
	 */
	Auth.getToken = function () {
		return this._token;
	};


	/**
	 * An Error that represents that an operation could not be performed
	 * because the user has not been authorized. Semantics like HTTP 401
	 */
	var UnauthorizedError = function (message) {
		Error.apply(this, arguments);
		this.message = message;
	};
	inherits(UnauthorizedError, Error);
	UnauthorizedError.prototype.name = "UnauthorizedError";


	Auth.UnauthorizedError = UnauthorizedError;
	return Auth;
});
