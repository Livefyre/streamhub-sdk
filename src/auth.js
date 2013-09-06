define(['streamhub-sdk/jquery', 'streamhub-sdk/event-emitter', 'streamhub-sdk/util'], function($, EventEmitter, util) {

    /**
     * This module is extremely EXPERIMENTAL. Currently, it provides a simple oauth login
     * against Livefyre's QA environment, to test oauth. It should not be used in a production
     * environment.
     *
     * To use, add "require('streamhub-sdk').Auth.login(_siteId_)" to a login click event to
     * request an oauth token, which can be used to post to the current site's comment stream
     * for an hour.
     *
     * To get/check existance of the current token, call "require('streamhub-sdk').Auth.getToken()"
     * which will return the lftoken or null if not available.
     * 
     * To enable a successful token callback, be sure to include
     * "require('streamhub-sdk').Auth.checkToken()" on the window.load event, which ensures the
     * default oauth callback is enabled for the current url.
     * @exports streamhub-sdk/auth
     */
    var _Auth = function() {
        EventEmitter.call(this);
    };
    util.inherits(_Auth, EventEmitter);

    var Auth = new _Auth();
    
    Auth._loginInterval = null;
    Auth._loginWindow = null;
    Auth._locationHash = null;
    Auth._token = null;
    Auth._expirey = null;
    
    Auth._oauthHost = "zuul.livefyre.com";
    Auth._oauthPort = 80;
    Auth._oauthPath = "/";

    /**
     * Logs in a user via oauth and sets their token on this object, optionally calls
     * a supplied callback.
     * @param network {String} The network to authenticate against the livefyre oauth server with.
     * @returns false
     */
    Auth.login = function(network) {
        if (typeof network != "string") {
            network = "livefyre.com";
        }
        if (Auth._loginInterval !== null) {
            clearInterval(Auth._loginInterval);
            Auth._loginInterval = null;
        }
        if (Auth._token !== null) {
            Auth._token = null;
        }
        if (Auth._loginWindow !== null) {
            Auth._loginWindow.close();
            Auth._loginWindow = null;
        }
        
        var url = ["http://",
            Auth._oauthHost,
            ":",
            Auth._oauthPort,
            Auth._oauthPath,
            "?redirect=",
            encodeURIComponent(window.location.toString()), 
            "&network=",
            network].join("");

        Auth._locationHash = window.location.hash;
        Auth._loginInterval = setInterval(Auth.checkLogin, 100);
        Auth._loginWindow = window.open(url, 'Login', 'height=270,width=408');
        
        if (window.focus) {
            Auth._loginWindow.focus();
        }
        
        return false;
    };
    
    /**
     * Gets the token for the currently authenticated user.
     * @returns The token
     */
    Auth.getToken = function() {
        return Auth._token;
    };

    /**
     * Sets the token for the currently authenticated user.
     */
    Auth.setToken = function(token) {
        Auth._token = token;
        Auth.emit('loggedin', token);
    };
    
    /**
     * Checks for a token response in the current window, by examining the current
     * window.location.hash and retreiving and storing the _lftoken parameter.
     */
    Auth.checkLogin = function() {
        if (!Auth._locationHash || window.location.hash != Auth._locationHash) {
            var parsedHash = window.location.hash.substr(1);
            var parts = parsedHash.split('&');

            for (var i = 0; i < parts.length; i++) {
                if (/_lftoken=/.test(parts[i])) {
                    Auth.setToken(parts[i].substr(9));
                    break;
                }
            }
        }
        if (Auth._token !== null) {
            if (Auth._locationHash !== null) {
                window.location.hash = Auth._locationHash;
                Auth._locationHash = null;
            }
            if (Auth._loginInterval !== null) {
                clearInterval(Auth._loginInterval);
                Auth._loginInterval = null;
            }
        }
    };

    return Auth;
});
