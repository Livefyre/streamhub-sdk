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
        this._version = opts.version;
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
     * @param [opts.version] {string} Version string to include in Bootstrap API
     *     resource paths. By default, one will not be added, which usually means '3.0'
     * @param callback {function} A callback that is called upon success/failure of the
     *     bootstrap request. Callback signature is "function(error, data)".
     */
    LivefyreBootstrapClient.prototype.getContent = function(opts, callback) {
        opts = opts || {};
        callback = callback || function() {};
        var environment = opts.environment = opts.environment || 'livefyre.com';
        var includeEnvironment = !this._isProdEnvironment(environment);
        var url = [
            this._getUrlBase(opts),
            "/bs3/",
            this._version ? this._version + '/' : '',
            includeEnvironment ? opts.environment + "/" : "",
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

    return LivefyreBootstrapClient;
});
