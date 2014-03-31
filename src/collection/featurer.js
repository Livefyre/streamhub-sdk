define([
    'streamhub-sdk/auth',
    'streamhub-sdk/collection/clients/write-client',
], function (Auth, LivefyreWriteClient) {
    'use strict';

    var Featurer = function (opts) {
        opts = opts || {};
        this._writeClient = opts.writeClient || new LivefyreWriteClient();
    };

    /**
     * Feature a content item
     * @param content {Content} The content item to feature
     * @param callback {function} The callback to be invoked upon
     *    successful/failed feature request. Callback has the signature,
     *    function(error , data)
     */
    Featurer.prototype.feature = function (content, callback) {
        this._writeClient.feature({
            network: content.collection.network,
            siteId: content.collection.siteId,
            collectionId: content.collection.id,
            lftoken: Auth.getToken(),
            contentId: content.id
        }, callback);
    };

    /**
     * Unfeature a content item
     * @param content {Content} The content item to unfeature
     * @param callback {function} The callback to be invoked upon
     *    successful/failed unfeature request. Callback has the signature,
     *    function(error , data)
     */
    Featurer.prototype.unfeature = function (content, callback) {
        this._writeClient.unfeature({
            network: content.collection.network,
            siteId: content.collection.siteId,
            collectionId: content.collection.id,
            lftoken: Auth.getToken(),
            contentId: content.id
        }, callback);
    };

    return Featurer;
});
