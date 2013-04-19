define(['streamhub-sdk/util', 'jquery', 'base64'], function(util, $) {

    /**
     * A Client for requesting Livefyre's Bootstrap Service
     * @exports streamhub-sdk/clients/livefyre-bootstrap-client
     */
    var LivefyreBootstrapClient = {};

    /**
     * Fetches data from the livefyre bootstrap service with the arguments given.
     * @param opts.network {string} The name of the network in the livefyre platform
     * @param opts.siteId {string} The livefyre siteId for the conversation
     * @param opts.articleId {string} The livefyre articleId for the conversation
     * @param opts.page {?string} Livefyre page name or number to fetch from bootstrap
     *     (default "init")
     * @param opts.environment {?string} Optional livefyre environment to use dev/prod environment
     * @param callback {function} A callback that is called upon success/failure of the
     *     bootstrap request. Callback signature is "function(error, data)".
     */
    LivefyreBootstrapClient.getContent = function(opts, callback) {
        opts = opts || {};
        callback = callback || function() {};

        var url = [
            'http://bootstrap.',
            util.streamhubHostFromOpts(opts),
            "/bs3/",
            opts.environment ? opts.environment + "/" : "",
            opts.network,
            "/",
            opts.siteId,
            "/",
            btoa(opts.articleId),
            "/",
            opts.page || "init",
            opts.extension || ".json"
        ].join("");


        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
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