define(['streamhub-sdk/util', 'streamhub-sdk/jquery', 'base64'], function(util, $) {
    'use strict';

    /**
     * A Client for requesting Livefyre's Auth Endpoint
     * @exports streamhub-sdk/clients/livefyre-auth-client
     */
    var LivefyreAuthClient = {};

    /**
     * Fetches data from the livefyre auth service with the arguments given.
     * @param opts {Object} The livefyre collection options.
     * @param opts.network {string} The name of the network in the livefyre platform
     * @param opts.siteId {string} The livefyre siteId for the conversation
     * @param opts.articleId {string} The livefyre articleId for the conversation
     * @param opts.token {string} The livefyre token for the user
     * @param callback {function} A callback that is called upon success/failure of the
     *     auth request. Callback signature is "function(error, data)".
     */
    LivefyreAuthClient.getAuthData = function(opts, callback) {
        opts = opts || {};
        callback = callback || function() {};

        var url = [
            'http://admin.',
            (opts.network === 'livefyre.com') ? opts.environment || 'livefyre.com' : opts.network,
            "/api/v3.0/auth/?siteId=",
            opts.siteId,
            "&articleId=",
            btoa(opts.articleId)
        ].join("");

        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            xhrFields: { withCredentials: true },
            success: function(data, status, jqXhr) {
                callback(null, data);
            },
            error: function(jqXhr, status, err) {
                callback(err);
            }
        });
    };

    return LivefyreAuthClient;

});