define(['streamhub-sdk/jquery'], function ($) {
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

        /**
         * If the user has requested not to be tracked by web sites, content,
         * or advertising. This can either be determined by the Livefyre
         * property being set by a customer or by the `doNotTrack` property
         * being set by the browser.
         * @type {boolean}
         * @private
         */
        this._doNotTrack = (window.Livefyre || {}).userPrivacyOptOut || window.navigator.doNotTrack === '1';
    };

    /**
     * Make an HTTP Request
     * @private
     * @param opts {object}
     * @param [opts.method=GET] {string} HTTP Method
     * @param opts.url {string} URL to request
     * @param opts.dataType {string} Data type to expect in response
     * @param callback {function=} A callback to pass (err, data) to
     * @param retries {number} The number of times remaining to retry the request if it fails
     */
    LivefyreHttpClient.prototype._request = function (opts, callback, retries) {
        callback = callback || function () {};
        var xhr = $.ajax({
            type: opts.method || 'GET',
            headers: this._getHeaders(opts),
            url: opts.url,
            data: opts.data,
            dataType: opts.dataType || this._getDataType()
        });

        xhr.done(function (data, status, jqXhr) {
            // todo: (genehallman) check livefyre stream status in data.status
            callback(null, data);
        });

        xhr.fail(function (jqXhr, status, err) {
            this._failHandler(jqXhr, status, err, callback, retries, opts);
        }.bind(this));

        return xhr;
    };

    /**
     * Fail handler an HTTP Request
     * @private
     * @param jqXhr {object}
     * @param status {object}
     * @param err {object}
     * @param callback {function=} A callback to pass (err, data) to
     * @param retries {number} Number of retries remaining for failed requests
     * @param requestOpts {object} Options used to make the request that invoked this fail handler, 
     * used to retry the request
     */
    LivefyreHttpClient.prototype._failHandler = function (jqXhr, status, err, callback, retries, requestOpts) {
        if (windowIsUnloading) {
            // Error fires when the user reloads the page during a long poll,
            // But we don't want to throw an exception if the page is
            // going away anyway.
            return;
        }

        if (retries > 0 && !(jqXhr.status >= 400 && jqXhr.status <= 500)) {
            setTimeout(function () {
                this._request(requestOpts, callback, --retries);
            }.bind(this), 1000);
            return;
        } 

        var errorMessage = err || 'LivefyreHttpClient Error';
        var httpError = createHttpError(
            errorMessage, jqXhr.status, jqXhr.responseJSON);
        callback(httpError);
    };

    /**
     * Get the $.ajax dataType to use.
     * @return {string}
     */
    LivefyreHttpClient.prototype._getDataType = function () {
        return $.support.cors ? 'json' : 'jsonp';
    };

    /**
     * Get headers for the request.
     * @param {Object} opts
     * @return {Object}
     */
    LivefyreHttpClient.prototype._getHeaders = function (opts) {
        var headers = {};

        // Add Do Not Track (DNT) header only if it's set to not track.
        if (this._doNotTrack) {
            headers['X-DNT'] = 1;
        }
        return headers;
    };

    /**
     * Get the base of the URL (protocol and hostname)
     * @param opts {object}
     * @param opts.network {string} StreamHub Network
     * @param opts.environment {string=} StreamHub environment
     */
    LivefyreHttpClient.prototype._getUrlBase = function (opts) {
        return 'https://' + this._getHost(opts);
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
        if (!isLivefyreNetwork) {
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

    function createHttpError(message, statusCode, body) {
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
