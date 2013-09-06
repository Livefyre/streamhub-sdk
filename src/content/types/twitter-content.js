define(['streamhub-sdk/content/content', 'streamhub-sdk/util'], function(Content, util) {
    
    /**
     * A base class that represents any piece of twitter content. This constructor saves the
     * "tweetId" property of the json object to "this".
     * @param json {Object} An object obtained via a Livefyre stream that represents the
     *        state of the content.
     * @exports streamhub-sdk/content/types/twitter-content
     * @constructor
     */ 
    var TwitterContent = function (json) {
        Content.call(this);
        json = json || {};
        this.tweetId = json.tweetId;
    };
    util.inherits(TwitterContent, Content);

    return TwitterContent;
 });
