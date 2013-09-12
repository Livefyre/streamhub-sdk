define(['event-emitter', 'streamhub-sdk/debug'],
function (EventEmitter, debug) {


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


	return Auth;
});
