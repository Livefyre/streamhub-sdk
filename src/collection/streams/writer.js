define([
    'stream/writable',
    'streamhub-sdk/collection/clients/write-client',
    'streamhub-sdk/auth',
    'inherits'],
function (Writable, LivefyreWriteClient, Auth, inherits) {
    'use strict';


    var CollectionWriter = function (opts) {
        this._collection = opts.collection;
        this._writeClient = opts.writeClient || new LivefyreWriteClient();
        Writable.call(this, opts);
    };

    inherits(CollectionWriter, Writable);


    CollectionWriter.prototype._write = function _write(content, done) {
        var self = this,
            collection = this._collection,
            token = Auth.getToken(),
            post = this._writeClient.postContent,
            numAttachments = content.attachments && content.attachments.length;

        if ( ! token) {
            throw new Auth.UnauthorizedError("Collection cannot write until streamhub-sdk/auth.setToken has been called");
        }

        if ( ! collection.id) {
            return collection.initFromBootstrap(function () {
                _write.call(self, content, done);
            });
        }
        
        var postParams = {
            body: content.body,
            network: collection.network,
            collectionId: collection.id,
            lftoken: Auth.getToken()
        };

        if (numAttachments) {
            postParams.media = [];
            for (var i=0; i < numAttachments; i++) {
                postParams.media.push(content.attachments[i].toJSON());
            }
        }

        if (content.parentId) {
            postParams.parent_id = content.parentId;
        }

        // Tweets can be posted by ID via _writeClient.postTweet
        if (content.tweetId) {
            post = this._writeClient.postTweet;
            postParams.tweetId = content.tweetId;
        }

        post(postParams, done);
    };


    return CollectionWriter;
});