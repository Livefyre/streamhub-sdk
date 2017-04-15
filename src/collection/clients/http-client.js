define(['jquery'], function($) {
    'use strict';

    /**
     * A Client for requesting Livefyre web services
     * This is private and should not be used or imported directly
     * @private
     * @param opts {object}
     * @param opts.serviceName {string} The StreamHub web service to request
     * @param opts.protocol {string} 'http:' or 'https:'
     */
    var LivefyreHttpClient = function (opts) {
        opts = opts || {};
        this._serviceName = opts.serviceName;
        this._protocol = opts.protocol || getDefaultProtocol();
        if (this._protocol.slice(-1) !== ':') {
            this._protocol += ':';
        }
    };

    /**
     * to avoid security vunerability only use https
     */
    function getDefaultProtocol() {
        return 'https:';
    }

    /**
     * Make an HTTP Request
     * @private
     * @param opts {object}
     * @param [opts.method=GET] {string} HTTP Method
     * @param opts.url {string} URL to request
     * @param opts.dataType {string} Data type to expect in response
     * @param callback {function=} A callback to pass (err, data) to
     */
    LivefyreHttpClient.prototype._request = function (opts, callback) {
        callback = callback || function() {};
        var xhr = $.ajax({
            type: opts.method || 'GET',
            url: opts.url,
            data: opts.data,
            dataType: opts.dataType || this._getDataType()
        });

        xhr.done(function(data, status, jqXhr) {
            // todo: (genehallman) check livefyre stream status in data.status
            callback(null, data);
        });

        xhr.fail(function(jqXhr, status, err) {
            if (windowIsUnloading) {
                // Error fires when the user reloads the page during a long poll,
                // But we don't want to throw an exception if the page is
                // going away anyway.
                return;
            }
            var errorMessage = err || 'LivefyreHttpClient Error';
            var httpError = createHttpError(
                errorMessage, jqXhr.status, jqXhr.responseJSON);
            callback(httpError);
        });

        return xhr;
    };

    /**
     * Get the $.ajax dataType to use
     */
    LivefyreHttpClient.prototype._getDataType = function () {
        if ($.support.cors) {
            return 'json';
        }
        return 'jsonp';
    };

    /**
     * Get the base of the URL (protocol and hostname)
     * @param opts {object}
     * @param opts.network {string} StreamHub Network
     * @param opts.environment {string=} StreamHub environment
     */
    LivefyreHttpClient.prototype._getUrlBase = function (opts) {
        return [
            this._protocol,
            '//',
            this._getHost(opts)
        ].join('');
    };

    /**
     * Get the host of the URL
     * @param opts {object}
     * @param opts.network {string} StreamHub Network
     * @param opts.environment {string=} StreamHub environment
     */
    LivefyreHttpClient.prototype._getHost = function (opts) {
        var isLivefyreNetwork = (opts.network === 'livefyre.com');
        var environment = opts.environment || 'livefyre.com';
        var host = this._serviceName + '.' + (isLivefyreNetwork ? environment : opts.network);
        var hostParts;
        // Make like 'customer.bootstrap.fyre.co'
        if ( ! isLivefyreNetwork ) {
            hostParts = opts.network.split('.');
            hostParts.splice(1, 0, this._serviceName);
            host = hostParts.join('.');
        }
        return host;
    };

    /**
     * Returns true if the environment is a production environment.
     * @param env {string=}
     * @private
     */
    LivefyreHttpClient.prototype._isProdEnvironment = function (env) {
        return (env == 'livefyre.com');
    }

    function createHttpError (message, statusCode, body) {
        var err = new Error(message);
        err.statusCode = statusCode;
        err.body = body;
        return err;
    }

    // Keep track of whether the page is unloading, so we don't throw exceptions
    // if the XHR fails just because of that.
    var windowIsUnloading = false;
    $(window).on('beforeunload', function () {
        windowIsUnloading = true;
    });

    return LivefyreHttpClient;

});
