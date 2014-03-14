define([
    'streamhub-sdk/collection/clients/http-client',
    'inherits',
    'base64'],
function(LivefyreHttpClient, inherits, base64) {
    'use strict';

    /**
     * A Client for requesting Livefyre's Bootstrap Service
     * @exports streamhub-sdk/collection/clients/bootstrap-client
     */
    var LivefyreBootstrapClient = function (opts) {
        opts = opts || {};
        opts.serviceName = 'bootstrap';
        LivefyreHttpClient.call(this, opts);
    };

    inherits(LivefyreBootstrapClient, LivefyreHttpClient);

    LivefyreBootstrapClient.prototype._serviceName = 'bootstrap';

    /**
     * Fetches data from the livefyre bootstrap service with the arguments given.
     * @param opts {Object} The livefyre collection options.
     * @param opts.network {string} The name of the network in the livefyre platform
     * @param opts.siteId {string} The livefyre siteId for the conversation
     * @param opts.articleId {string|number} The livefyre articleId for the conversation
     * @param [opts.page] {string} Livefyre page name or number to fetch from bootstrap
     *     (default "init")
     * @param [opts.environment] {string} Optional livefyre environment to use dev/prod environment
     * @param callback {function} A callback that is called upon success/failure of the
     *     bootstrap request. Callback signature is "function(error, data)".
     */
    LivefyreBootstrapClient.prototype.getContent = function(opts, callback) {
        opts = opts || {};
        callback = callback || function() {};
        var environment = opts.environment = opts.environment || 'livefyre.com';

        var url = [
            this._getUrlBase(opts),
            "/bs3/",
            opts.network,
            "/",
            opts.siteId,
            "/",
            base64.btoa(opts.articleId.toString()),
            "/",
            typeof opts.page !== 'undefined' ? opts.page+'.json' : "init"
        ].join("");

        this._request({
            url: url
        }, callback);
    };

    LivefyreBootstrapClient.prototype.getAuthorContent = function (opts, callback) {
        opts = opts || {};
        callback = callback || function() {};
        var environment = opts.environment = opts.environment || 'livefyre.com';

        var url = [
            this._getUrlBase(opts),
            "/api/v3.1",
            "/author/",
            opts.authorId,
            "/content/",
        ].join("");

        this._request({
            url: url
        }, callback);
    };

    return LivefyreBootstrapClient;
});
