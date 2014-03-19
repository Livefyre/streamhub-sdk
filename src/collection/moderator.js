define([
    'streamhub-sdk/auth',
    'streamhub-sdk/collection/clients/write-client',
], function (Auth, LivefyreWriteClient) {
    'use strict';

    var Moderator = function (opts) {
        opts = opts || {};
        this._writeClient = opts.writeClient || new LivefyreWriteClient();
    };

    Moderator.prototype.trash = function (content, callback) {
        this._writeClient.trashContent({
            contentId: content.id,
            siteId: content.collection.siteId,
            collectionId: content.collection.id,
            network: content.collection.network,
            lftoken: Auth.getToken()
        }, callback);
    };

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
