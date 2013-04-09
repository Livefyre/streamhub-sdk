define(['jquery'], function($) {

    /**
     * A Client for requesting Livefyre's Stream Service
     * @exports streamhub-sdk/clients/livefyre-stream-client
     */
    var LivefyreStreamClient = {};

    /**
     * Fetches content from the livefyre conversation stream with the supplied arguments.
     * @param opts.network {string} The name of the network in the livefyre platform
     * @param opts.collectionId {string} The livefyre collectionId for the conversation stream
     * @param opts.commentId {?string} The commentId to fetch content from (default "0")
     * @param callback {function} A callback that is called upon success/failure of the
     * stream request. Callback signature is "function(error, data)".
     */
    LivefyreStreamClient.getContent = function(opts, callback) {
        opts = opts || {};
        callback = callback || function() {};

        var url = [
            "http://stream1.",
            opts.network,
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
                    return callback("Timeout");
                } else if (data.status == "error") {
                    return callback(data.msg);
                }
                callback(null, data.data);
            },
            error: function(jqXhr, status, err) {
                callback(err);
            }
        });
        
    };
    
    return LivefyreStreamClient;

});