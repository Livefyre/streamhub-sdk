define(['streamhub-sdk/content/types/twitter-content'], function(TwitterContent) {
    var TwitterSearchContent = function (json) {
        TwitterContent.call(this);
        this.tweetId = json.id_str;
        this.author = {
            twitterUserId: json.from_user_id_str,
            displayName: json.from_user,
            name: json.from_user_name,
            avatar: json.profile_image_url
        };
        this.body = json.text;
        this.createdAt = new Date(json.created_at);
    };
    TwitterSearchContent.prototype = new TwitterContent();

    return TwitterSearchContent;
 });