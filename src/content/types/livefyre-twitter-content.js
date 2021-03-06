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
        this.tweetId = LivefyreTwitterContent.tweetIdFromLivefyreId(this.id);
        if (this.author) {
            this.author.twitterUserId = LivefyreTwitterContent.twitterUserIdFromLivefyreAuthorId(this.author.id);
        }
        this.twitterVerified = LivefyreTwitterContent.isVerified(this.meta);
    };
    inherits(LivefyreTwitterContent, LivefyreContent);

    LivefyreTwitterContent.prototype.typeUrn = 'urn:livefyre:js:streamhub-sdk:content:types:livefyre-twitter';

    /**
     * Determine if the author of the content is verified by Twitter.
     * @param {Object} json The content to look through for the verified status.
     * @return {Boolean} Whether the author is verified or not.
     */
    LivefyreTwitterContent.isVerified = function (json) {
        var tweetMeta = json.content.annotations.tweetMeta || {};
        return tweetMeta.verified_user || false;
    };

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


    LivefyreTwitterContent.prototype.addAttachment = function (oembed) {
        if (oembed && oembed.type === 'link') {
            var provider = oembed.provider_name ? oembed.provider_name.toLowerCase() : null;
            var providerIsTwitter = provider && ['twitter', 'twimg'].indexOf(provider) > -1;
            var linkIsVideo = /twitter\.com.*\/video\/\d+/.test(oembed.link);
            var titleIsVideo = oembed.title && oembed.title.toLowerCase() === 'twitter video';

            // Twitter gives us inconsistent data and this is a hack to attempt
            // to provide a decent visual experience for twitter content. Now
            // if there is a link from twitter or twimg, we only remove it if
            // we think it's pointing to a video.
            if (providerIsTwitter && (linkIsVideo || titleIsVideo)) {
                return;
            }
        }

        return LivefyreContent.prototype.addAttachment.apply(this, arguments);
    };

    return LivefyreTwitterContent;
});
