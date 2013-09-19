define(['streamhub-sdk/jquery', 'streamhub-sdk/util'], function($, util) {
    'use strict';


    /**
     * A Client for requesting Livefyre's Stream Service
     * @exports streamhub-sdk/collection/clients/stream-client
     */
    var LivefyreStreamClient = function () {};


    // Keep track of whether the page is unloading, so we don't throw exceptions
    // if the XHR fails just because of that.
    var windowIsUnloading = false;
    $(window).on('beforeunload', function () {
        windowIsUnloading = true;
    });


    /**
     * Fetches content from the livefyre conversation stream with the supplied arguments.
     * @param opts {Object} The livefyre collection options.
     * @param opts.network {string} The name of the network in the livefyre platform
     * @param opts.collectionId {string} The livefyre collectionId for the conversation stream
     * @param opts.commentId {?string} The commentId to fetch content from (default "0")
     * @param callback {function} A callback that is called upon success/failure of the
     * stream request. Callback signature is "function(error, data)".
     */
    LivefyreStreamClient.prototype.getContent = function(opts, callback) {
        opts = opts || {};
        callback = callback || function() {};

        var url = [
            "http://stream1.",
            (opts.network === 'livefyre.com') ? opts.environment || 'livefyre.com' : opts.network,
            "/v3.0/collection/",
            opts.collectionId,
            "/",
            opts.commentId || "0",
            "/"
        ].join("");

        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            success: function(data, status, jqXhr) {
                // todo: (genehallman) check livefyre stream status in data.status
                if (data.timeout) {
                    return callback(null, { timeout: data.timeout });
                } else if (data.status === "error") {
                    return callback(data.msg);
                }
                callback(null, data.data);
            },
            error: function(jqXhr, status, err) {
                if (windowIsUnloading) {
                    // Error fires when the user reloads the page during a long poll,
                    // But we don't want to throw an exception if the page is
                    // going away anyway.
                    return;
                }
                if ( ! err) {
                    err = "LivefyreStreamClient Error";
                }
                callback(err);
            }
        });
    };

    return LivefyreStreamClient;
});