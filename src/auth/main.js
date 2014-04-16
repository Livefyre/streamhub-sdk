define(['auth', 'inherits', 'event-emitter', 'streamhub-sdk/debug'],
function (auth, inherits, EventEmitter, debug) {
    'use strict';


    var log = debug('streamhub-sdk/auth');


    /**
     * An object that knows about the authenticated user
     */
    var Auth = new EventEmitter();


    /**
     * Set the Auth token
     * This is deprecated now. You should use the `auth` module's
     * `.authenticate({ livefyre: token })` method
     * But will be supported in streamhub-sdk v2 for backward compatability
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
        var livefyreUser = auth.get('livefyre');
        if ( ! livefyreUser) {
            return this._token;
        }
        return livefyreUser.get('token');
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
