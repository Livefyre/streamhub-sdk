define(['jquery',
    'streamhub-sdk/content/content',
    'streamhub-sdk/content/types/livefyre-content'
], function($, Content, LivefyreContent) {

    var LivefyreTweet = function (json) {
        LivefyreContent.call(this, json);
        this.tweetId = LivefyreTweet.tweetIdFromLivefyreId(this.id);
        this.author.twitterUserId = LivefyreTweet.twitterUserIdFromLivefyreAuthorId(this.author.id);
    };
    $.extend(LivefyreTweet.prototype, LivefyreContent.prototype);

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

    Content.register(LivefyreTweet);
     
    return LivefyreTweet;
 });