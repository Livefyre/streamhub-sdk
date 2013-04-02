define(['jquery',
    'streamhub-sdk/content/types/twitter-content',
    'streamhub-sdk/content/types/livefyre-content'
], function($, TwitterContent, LivefyreContent) {

    var LivefyreTweet = function (json) {
        LivefyreContent.call(this, json);
        TwitterContent.call(this, json);
        this.tweetId = LivefyreTweet.tweetIdFromLivefyreId(this.id);
        this.author.twitterUserId = LivefyreTweet.twitterUserIdFromLivefyreAuthorId(this.author.id);
    };
    LivefyreTweet.prototype = $.extend({ constructor: LivefyreContent }, LivefyreContent.prototype, TwitterContent.prototype);

    LivefyreTweet.tweetIdFromLivefyreId = function (livefyreId) {
        var pattern = /tweet-(\d+)@twitter.com/,
            match = livefyreId.match(pattern);
        if ( ! match) {
            throw new Error("Can't parse tweet ID from Livefyre ID");
        }
        return match[1];
    };

    LivefyreTweet.twitterUserIdFromLivefyreAuthorId = function (authorId) {
        var pattern = /([^@]+)@twitter.com/,
            match = authorId.match(pattern);
        if ( ! match) {
            throw new Error("Can't parse twitterUserId from Livefyre authorId");
        }
        return match[1];
    };
     
    return LivefyreTweet;
 });