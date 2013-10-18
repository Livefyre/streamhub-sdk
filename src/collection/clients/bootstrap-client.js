define([
    'streamhub-sdk/jquery',
    'base64'],
    function($) {
    'use strict';

    /**
     * A Client for requesting Livefyre's Bootstrap Service
     * @exports streamhub-sdk/collection/clients/bootstrap-client
     */
    var LivefyreBootstrapClient = function () {};

    /**
     * Fetches data from the livefyre bootstrap service with the arguments given.
     * @param opts {Object} The livefyre collection options.
     * @param opts.network {string} The name of the network in the livefyre platform
     * @param opts.siteId {string} The livefyre siteId for the conversation
     * @param opts.articleId {string} The livefyre articleId for the conversation
     * @param [opts.page] {string} Livefyre page name or number to fetch from bootstrap
     *     (default "init")
     * @param [opts.environment] {string} Optional livefyre environment to use dev/prod environment
     * @param callback {function} A callback that is called upon success/failure of the
     *     bootstrap request. Callback signature is "function(error, data)".
     */
    LivefyreBootstrapClient.prototype.getContent = function(opts, callback) {
        var isLocaldev;
        opts = opts || {};
        callback = callback || function() {};
        isLocaldev = opts.environment && opts.environment === 'fyre';

        var url = [
            'http://bootstrap.',
            (opts.network === 'livefyre.com') ? opts.environment || 'livefyre.com' : opts.network,
            "/bs3/",
            (opts.environment && ! isLocaldev) ? opts.environment + "/" : "",
            opts.network,
            "/",
            opts.siteId,
            "/",
            btoa(opts.articleId),
            "/",
            typeof opts.page !== 'undefined' ? opts.page+'.json' : "init"
        ].join("");

        $.ajax({
            type: "GET",
            url: url,
            dataType: $.support.cors ? "json" : "jsonp",
            success: function(data, status, jqXhr) {
                // todo: (genehallman) check livefyre stream status in data.status
                callback(null, data);
            },
            error: function(jqXhr, status, err) {
                callback(err);
            }
        });
    };

    return LivefyreBootstrapClient;

});