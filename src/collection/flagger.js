'use strict';

var LivefyreWriteClient = require('streamhub-sdk/collection/clients/write-client');
var Auth = require('streamhub-sdk/auth');

var Flagger = function (opts) {
    opts = opts || {};
    this._writeClient = opts.writeClient || new LivefyreWriteClient();
};

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
