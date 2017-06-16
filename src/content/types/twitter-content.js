define(['streamhub-sdk/content', 'inherits'], function(Content, inherits) {
    'use strict';
    
    /**
     * A base class that represents any piece of twitter content. This constructor saves the
     * "tweetId" property of the json object to "this".
     * @param json {Object} An object obtained via a Livefyre stream that represents the
     *        state of the content.
     * @exports streamhub-sdk/content/types/twitter-content
     * @constructor
     */
    var TwitterContent = function (json) {
        Content.call(this, this);
        json = json || {};
        this.tweetId = json.tweetId;
    };
    inherits(TwitterContent, Content);

    /**
     * Return whether this Content has products or not.
     * @return {boolean}
     */
    TwitterContent.prototype.hasProducts = function () {
        return ((this.links || {}).product || []).length > 0;
    };

    /**
     * Return whether this Content has rights granted or not.
     * @return {boolean}
     */
    TwitterContent.prototype.hasRightsGranted = function () {
        return (this.rights || {}).status === 'granted';
    };

    return TwitterContent;
});
