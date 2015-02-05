define([
    'streamhub-sdk/collection/clients/http-client',
    'inherits'],
function(LivefyreHttpClient, inherits) {
    'use strict';

    /**
     * A Client for requesting Livefyre's Stream Service
     * @exports streamhub-sdk/collection/clients/stream-client
     */
    var LivefyreStreamClient = function (opts) {
        opts = opts || {};
        opts.serviceName = 'stream1';
        this._version = opts.version || 'v3.1';
        LivefyreHttpClient.call(this, opts);
    };

    inherits(LivefyreStreamClient, LivefyreHttpClient);

    LivefyreStreamClient.prototype._serviceName = 'stream1';

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
            this._getUrlBase(opts),
            "/",
            this._version,
            "/collection/",
            opts.collectionId,
            "/",
            opts.commentId || "0",
            "/?backend=js-sdk"
        ].join("");

        var request = this._request({
            url: url
        }, function (err, data) {
            if (err) {
                return callback.apply(this, arguments);
            }
            if (data.timeout) {
                return callback(null, { timeout: data.timeout });
            }
            if (data.status === 'error') {
                return callback(data.msg);
            }
            callback(null, data.data);
        });

        return request;
    };

    return LivefyreStreamClient;
});
