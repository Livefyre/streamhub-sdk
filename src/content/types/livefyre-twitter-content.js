define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/content/types/twitter-content',
    'streamhub-sdk/content/types/livefyre-content',
    'inherits'
], function($, TwitterContent, LivefyreContent, inherits) {
    'use strict';

    /**
     * A tweet constructed from a StreamHub state response from a twitter source
     * @param json {Object} A state response from a StreamHub API
     * @param json.id {String} A Livefyre Message ID for this Content
     * @param [json.author.id] {String} A Livefyre Author ID for the tweeter
     * @exports streamhub-sdk/content/types/livefyre-twitter-content
     * @constructor
     */
    var LivefyreTwitterContent = function (json) {
        LivefyreContent.call(this, json);
        TwitterContent.call(this, json);
        this.tweetId = LivefyreTwitterContent.tweetIdFromLivefyreId(this.id);
        if (this.author) {
            this.author.twitterUserId = LivefyreTwitterContent.twitterUserIdFromLivefyreAuthorId(this.author.id);
        }
    };
    inherits(LivefyreTwitterContent, LivefyreContent);
    $.extend(LivefyreTwitterContent.prototype, TwitterContent.prototype);

    /**
     * Transform a Livefyre Message ID to a Twitter tweet id
     * @param livefyreId {String} A Livefyre Message ID
     * @throws {Error} If livefyreId cannot be parsed
     * @return {String} A tweet ID
     */
    LivefyreTwitterContent.tweetIdFromLivefyreId = function (livefyreId) {
        var pattern = /tweet-(\d+)@twitter.com/,
            match = livefyreId.match(pattern);
        if ( ! match) {
            throw new Error("Can't parse tweet ID from Livefyre ID");
        }
        return match[1];
    };

    /**
     * Transform a Livefyre authorId to a Twitter user id
     * @param authorId {String} A Livefyre authorId
     * @throws {Error} If authorId cannot be parsed
     * @return {String} A Twitter user id if parseable
     */
    LivefyreTwitterContent.twitterUserIdFromLivefyreAuthorId = function (authorId) {
        var pattern = /([^@]+)@twitter.com/,
            match = authorId.match(pattern);
        if ( ! match) {
            throw new Error("Can't parse twitterUserId from Livefyre authorId");
        }
        return match[1];
    };

    return LivefyreTwitterContent;
 });
