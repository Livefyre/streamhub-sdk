var $ = require('streamhub-sdk/jquery');
var inherits = require('inherits');
var LivefyreHttpClient = require('streamhub-sdk/collection/clients/http-client');

'use strict';

/**
 * Connects to the Livefyre network to grab a single comment state and
 * related thread states
 * @param [opts] {object}
 * @param [opts.serviceName] {string} The StreamHub web service to request
 * @param [opts.protocol] {string} 'http:' or 'https:'
 * @extends {LivefyreHttpClient}
 * @constructor
 */
var LivefyreContentClient = function (opts) {
    opts = opts || {};
    opts.serviceName = opts.serviceName || this._serviceName;
    LivefyreHttpClient.call(this, opts);
};
inherits(LivefyreContentClient, LivefyreHttpClient);

LivefyreContentClient.prototype._serviceName = 'bootstrap';

/**
 * Fetches a content thread from the livefyre conversation stream with the
 * supplied arguments. Parents will be provided for content that has parentId.
 * @param opts {Object} The livefyre collection options.
 * @param opts.network {!string} The name of the network in the livefyre platform
 * @param opts.collectionId {!string} The livefyre collectionId for the conversation stream
 * @param opts.contentId {!string} The commentId to fetch content from
 * @param [opts.depthOnly] {boolean} False by default. Set to true to return all
 *      replies to the specified contentId
 * @param [opts.environment] {string} Optional livefyre environment to use dev/prod environment
 * @param callback {function} A callback that is called upon success/failure of the
 *      stream request. Callback signature is "function(error, data)".
 */
LivefyreContentClient.prototype.getContent = function(opts, callback) {
    opts = opts || {};
    callback = callback || function() {};

    var url = [
        this._getUrlBase(opts),
        "/api/v3.0/content/thread/"
    ].join("");

    var request = this._request({
        url: url,
        data: {
            collection_id: opts.collectionId,
            content_id: opts.contentId,
            depth_only: opts.depthOnly || false
        }
    }, function (err, data) {
        if (err) {
            return callback.apply(this, arguments);
        }
        if (data.status === 'error') {
            return callback(data.msg);
        }
        callback(null, data.data);
    });

    return request;
};

module.exports = LivefyreContentClient;
