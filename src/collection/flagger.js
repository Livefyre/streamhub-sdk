'use strict';

var LivefyreWriteClient = require('streamhub-sdk/collection/clients/write-client');
var Auth = require('streamhub-sdk/auth');

var Flagger = function (opts) {
    opts = opts || {};
    this._writeClient = opts.writeClient || new LivefyreWriteClient();
};

/**
 * Flag a piece of content
 * @param opts {Object} The livefyre collection options.
 * @param opts.flagType {string} The flag type
 *     (e.g. 'offensive', 'spam', 'disagree', 'off-topic')
 * @param opts.contentId {string} The ID of the content to flag
 * @param opts.collectionId {string} The livefyre collectionId for the conversation
 * @param opts.lftoken {string} The livefyre user auth token
 * @param callback {function} A callback that is called upon success/failure of the
 *     write request. Callback signature is "function(error, data)".
 */
Flagger.prototype.flag = function (opts, callback) {
    this._writeClient.flag({
        network: opts.content.collection.network,
        siteId: opts.content.collection.siteId,
        collectionId: opts.content.collection.id,
        lftoken: Auth.getToken(),
        contentId: opts.content.id,
        flagType: opts.flagType
    }, callback);
}

module.exports = Flagger;
