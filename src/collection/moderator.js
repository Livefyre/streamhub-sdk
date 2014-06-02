define([
    'streamhub-sdk/auth',
    'streamhub-sdk/collection/clients/write-client',
], function (Auth, LivefyreWriteClient) {
    'use strict';

    var Moderator = function (opts) {
        opts = opts || {};
        this._writeClient = opts.writeClient || new LivefyreWriteClient();
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

    Moderator.prototype.trash = function (content, callback) {
        this._writeClient.trashContent({
            contentId: content.id,
            siteId: content.collection.siteId,
            collectionId: content.collection.id,
            network: content.collection.network,
            lftoken: Auth.getToken()
        }, callback);
    };

    Moderator.prototype.bozo = function (content, callback) {
        this._writeClient.bozoContent({
            contentId: content.id,
            siteId: content.collection.siteId,
            collectionId: content.collection.id,
            network: content.collection.network,
            lftoken: Auth.getToken()
        }, callback);
    };

    /**
     * Ban a user.
     * @param opts.content {object} A content item by the user.
     * @param callback {function} A callback that is called upon success/failure of the
     *     write request. Callback signature is "function(error, data)".
     * @param opts {object} Ban API options.
     * @param opts.networkBan {boolean} Ban the user across all sites in the network.
     * @param opts.retroactive {number} Apply ban to previously posted content by the user. 0 or 1
     * @param opts.sites {array} List of site IDs, if different from site ID of content param.
     */
    Moderator.prototype.ban = function (content, callback, opts) {
        var params = {
            authorId: content.author.id,
            retroactive: ('retroactive' in opts) ? opts.retroactive : 0,
            lftoken: Auth.getToken()
        };
        // Must include either "network" or "sites" as a param: http://docs.livefyre.com/developers/api-reference/#flex-ban
        if(opts.networkBan) {
            params.network = content.collection.network;
        } else {
            params.sites = (opts.sites) ? opts.sites.join(',') : content.collection.siteId;
        }
        this._writeClient.banUser(params, callback);
    };

    Moderator.prototype.unban = function (content, callback, opts) {
        var params = {
            authorId: content.author.id,
            retroactive: ('retroactive' in opts) ? opts.retroactive : 0,
            lftoken: Auth.getToken()
        };
        // Must include either "network" or "sites" as a param: http://docs.livefyre.com/developers/api-reference/#flex-unban
        if(opts.networkBan) {
            params.network = content.collection.network;
        } else {
            params.sites = (opts.sites) ? opts.sites.join(',') : content.collection.siteId;
        }
        this._writeClient.unbanUser(params, callback);
    };

    return Moderator;
});
