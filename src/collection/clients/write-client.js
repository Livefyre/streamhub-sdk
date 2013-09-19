define(['streamhub-sdk/jquery', 'base64'], function($) {
    'use strict';

    /**
     * A Client for requesting Livefyre's Quill/Write Service
     * @exports streamhub-sdk/collection/clients/write-client
     */
    var LivefyreWriteClient = function () {};

    /**
     * Posts a piece of content to a Livefyre collection.
     * @param opts {Object} The livefyre collection options.
     * @param opts.network {string} The name of the network in the livefyre platform
     * @param opts.collectionId {string} The livefyre collectionId for the conversation
     * @param opts.lftoken {string} The livefyre user auth token
     * @param opts.body {string} The content's body html with the following allowed tags:
     *     a, img, span, label, p, br, strong, em, u, blockquote, ul, li, ol, pre
     * @param opts.media {array} An Array of oEmbed JSON Objects to attach to the posted Content
     * @param callback {function} A callback that is called upon success/failure of the
     *     write request. Callback signature is "function(error, data)".
     */
    LivefyreWriteClient.prototype.postContent = function(opts, callback) {
        opts = opts || {};
        callback = callback || function() {};
        var url = [
            "http://quill.",
            opts.network,
            "/api/v3.0/collection/",
            opts.collectionId,
            "/post/"
        ].join("");

        var postData = {
            body: opts.body,
            lftoken: opts.lftoken
        };

        if (opts.parent_id) {
            postData.parent_id = opts.parent_id;
        }

        if (opts.media) {
            postData.media = JSON.stringify(opts.media);
        }

        $.ajax({
            type: "POST",
            url: url,
            data: postData,
            success: function(data, status, jqXhr) {
                // todo: (genehallman) check livefyre stream status in data.status
                callback(null, data);
            },
            error: function(jqXhr, status, err) {
                callback(err);
            }
        });
    };

    /**
     * Posts a tweet to a Livefyre collection.
     * @param opts {Object} The livefyre collection options.
     * @param opts.network {string} The name of the network in the livefyre platform
     * @param opts.collectionId {string} The livefyre collectionId for the conversation
     * @param opts.lftoken {string} The livefyre user auth token
     * @param opts.tweetId {string} The Tweet ID of the tweet to add to the Collection
     * @param callback {function} A callback that is called upon success/failure of the
     *     write request. Callback signature is "function(error, data)".
     */
    LivefyreWriteClient.prototype.postTweet = function(opts, callback) {
        opts = opts || {};
        callback = callback || function() {};
        var url = [
            "http://quill.",
            opts.network,
            "/api/v3.0/collection/",
            opts.collectionId,
            "/post/tweet/"
        ].join("");

        var postData = {tweet_id: opts.tweetId, lftoken: opts.lftoken};

        $.ajax({
            type: "POST",
            url: url,
            data: postData,
            success: function(data, status, jqXhr) {
                // todo: (genehallman) check livefyre stream status in data.status
                callback(null, data);
            },
            error: function(jqXhr, status, err) {
                callback(err);
            }
        });
    };

    LivefyreWriteClient.prototype.follow = function(opts, callback) {
        opts = opts || {};
        callback = callback || function() {};
        var url = [
            "http://quill.",
            opts.network,
            "/api/v3.0/collection/",
            opts.collectionId,
            "/follow/"
        ].join("");

        var postData = {lftoken: opts.lftoken};

        $.ajax({
            type: "POST",
            url: url,
            data: postData,
            success: function(data, status, jqXhr) {
                callback(null, data);
            },
            error: function(jqXhr, status, err) {
                callback(err);
            }
        });
    };

    LivefyreWriteClient.prototype.unfollow = function(opts, callback) {
        opts = opts || {};
        callback = callback || function() {};
        var url = [
            "http://quill.",
            opts.network,
            "/api/v3.0/collection/",
            opts.collectionId,
            "/unfollow/"
        ].join("");

        var postData = {lftoken: opts.lftoken};

        $.ajax({
            type: "POST",
            url: url,
            data: postData,
            success: function(data, status, jqXhr) {
                callback(null, data);
            },
            error: function(jqXhr, status, err) {
                callback(err);
            }
        });
    };

    return LivefyreWriteClient;

});