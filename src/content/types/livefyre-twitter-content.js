define([
    'jquery',
    'streamhub-sdk/content/types/twitter-content',
    'streamhub-sdk/content/types/livefyre-content'
], function($, TwitterContent, LivefyreContent) {

    var LivefyreTwitterContent = function (json) {
        LivefyreContent.call(this, json);
        TwitterContent.call(this, json);
        this.tweetId = LivefyreTwitterContent.tweetIdFromLivefyreId(this.id);
        if (this.author) {
            this.author.twitterUserId = LivefyreTwitterContent.twitterUserIdFromLivefyreAuthorId(this.author.id);
        }
    };
    LivefyreTwitterContent.prototype = $.extend(new LivefyreContent(), TwitterContent.prototype);

    LivefyreTwitterContent.tweetIdFromLivefyreId = function (livefyreId) {
        if (!livefyreId) {
            return;
        }
        var pattern = /tweet-(\d+)@twitter.com/,
            match = livefyreId.match(pattern);
        if ( ! match) {
            throw new Error("Can't parse tweet ID from Livefyre ID");
        }
        return match[1];
    };

    LivefyreTwitterContent.twitterUserIdFromLivefyreAuthorId = function (authorId) {
        if (!authorId) {
            return;
        }
        var pattern = /([^@]+)@twitter.com/,
            match = authorId.match(pattern);
        if ( ! match) {
            throw new Error("Can't parse twitterUserId from Livefyre authorId");
        }
        return match[1];
    };
     
    return LivefyreTwitterContent;
 });