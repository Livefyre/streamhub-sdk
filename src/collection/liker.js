define([
    'streamhub-sdk/auth',
    'streamhub-sdk/collection/clients/write-client'
], function (Auth, LivefyreWriteClient) {
    'use strict';

    var Liker = function (opts) {
        opts = opts || {};
        this._writeClient = opts.writeClient || new LivefyreWriteClient();
    };

    /**
     * Like a piece of content
     * @param opts {Object} The livefyre collection options.
     * @param opts.contentId {string} The ID of the content to like
     * @param opts.collectionId {string} The livefyre collectionId for the conversation
     * @param opts.lftoken {string} The livefyre user auth token
     * @param callback {function} A callback that is called upon success/failure of the
     *     write request. Callback signature is "function(error, data)".
     */
    Liker.prototype.like = function (content, callback) {
        this._writeClient.like({
            network: content.collection.network,
            siteId: content.collection.siteId,
            collectionId: content.collection.id,
            lftoken: Auth.getToken(),
            contentId: content.id
        }, callback);
    };

    /**
     * Unlike a piece of content
     * @param opts {Object} The livefyre collection options.
     * @param opts.contentId {string} The ID of the content to unlike
     * @param opts.collectionId {string} The livefyre collectionId for the conversation
     * @param opts.lftoken {string} The livefyre user auth token
     * @param callback {function} A callback that is called upon success/failure of the
     *     write request. Callback signature is "function(error, data)".
     */
    Liker.prototype.unlike = function (content, callback) {
        this._writeClient.unlike({
            network: content.collection.network,
            siteId: content.collection.siteId,
            collectionId: content.collection.id,
            lftoken: Auth.getToken(),
            contentId: content.id
        }, function (err, response) {
            if (err) {
                return callback(err);
            }
            // Remove the opine on the content now in case stream
            // takes awhile to broadcast
            var removedOpineId = cleanQuillOpineId(response.data.opinionId);
            content.removeOpine(removedOpineId);
            callback(undefined, response);
        });
    };

    function cleanQuillOpineId (opineId) {
        var realId = opineId.replace(/\.\d$/, '');
        return realId;
    }

    return Liker;
});
