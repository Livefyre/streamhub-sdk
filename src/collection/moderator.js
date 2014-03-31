define([
    'streamhub-sdk/auth',
    'streamhub-sdk/collection/clients/write-client',
], function (Auth, LivefyreWriteClient) {
    'use strict';

    var Moderator = function (opts) {
        opts = opts || {};
        this._writeClient = opts.writeClient || new LivefyreWriteClient();
    };

    /**
     * Updates an existing piece of content in a Livefyre collection.
     * @param opts {Object} Update content options
     * @param opts.contentId {string} The ID of the content to trash
     * @param opts.collectionId {string} The collection ID of the content
     * @param opts.siteId {string} The site ID of the content
     * @param opts.lftoken {string} The livefyre user auth token
     * @param callback {function} A callback that is called upon sucess/failure
     *     of the update request. Callback signature is "function(error, data)".
     */
    Moderator.prototype.trash = function (content, callback) {
        this._writeClient.trashContent({
            contentId: content.id,
            siteId: content.collection.siteId,
            collectionId: content.collection.id,
            network: content.collection.network,
            lftoken: Auth.getToken()
        }, callback);
    };

    /**
     * Updates an existing piece of content in a Livefyre collection.
     * @param opts {Object} Update content options
     * @param opts.body {string} The body to update the content with
     * @param opts.contentId {string} The ID of the content to update
     * @param opts.collectionId {string} The collection ID of the content
     * @param opts.siteId {string} The site ID of the content
     * @param opts.lftoken {string} The livefyre user auth token
     * @param callback {function} A callback that is called upon sucess/failure
     *     of the update request. Callback signature is "function(error, data)".
     */
    Moderator.prototype.edit = function (content, callback) {
        this._writeClient.updateContent({
            body: content.body,
            contentId: content.id,
            siteId: content.collection.siteId,
            collectionId: content.collection.id,
            network: content.collection.network,
            lftoken: Auth.getToken()
        }, callback);
    };

    return Moderator;
});
