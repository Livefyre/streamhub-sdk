define(['jquery',
    'streamhub-sdk/content',
    'streamhub-sdk/content-types/livefyre-content'
], function($, Content, LivefyreContent) {

    var LivefyreTweet = function (json) {
        LivefyreContent.call(this, json);
        this.tweetId = LivefyreTweet.tweetIdFromLivefyreId(this.id);
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

    Content.register(LivefyreTweet);
     
    return LivefyreTweet;
 });