define(['jquery', 'streamhub-sdk/content/types/twitter-content'],
function($, TwitterContent) {
    var TwitterStreamingContent = function (json) {
        TwitterContent.call(this);
        this.tweetId = json.id_str;
        this.author = {
            twitterUserId: json.user.id_str,
            displayName: json.user.screen_name,
            name: json.user.name,
            avatar: json.user.profile_image_url
        };
        this.body = json.text;
        this.createdAt = new Date(json.created_at);
    };
    TwitterStreamingContent.prototype = new TwitterContent();

    return TwitterStreamingContent;
 });