define(['streamhub-sdk/jquery'], function($) {
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
        this._protocol = opts.protocol || document.location.protocol;
        if (this._protocol.slice(-1) !== ':') {
            this._protocol += ':';
        }
    };

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
            var httpError = createHttpError(errorMessage, jqXhr.status, status);
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
        var host = this._serviceName + '.' + (isLivefyreNetwork ? opts.environment : opts.network);
        var hostParts;
        if ( ! isLivefyreNetwork && this._protocol === 'https:') {
            hostParts = opts.network.split('.');
            // Make like 'customer.bootstrap.fyre.co'
            hostParts.splice(1, 0, this._serviceName);
            host = hostParts.join('.');
        }
        return host;
    };

    /**
     * Create an Error object representing a failure to complete an HTTP request
     * @param message {string} a developer friendly error message
     * @param statusCode {number} HTTP status code of response, if available
     * @param errType {string} 'error' or 'abort' if the request was aborted by
     *     the user-agent
     */
    function createHttpError (message, statusCode, errType) {
        var err = new Error(message);
        err.statusCode = statusCode;
        err.type = errType;
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