define([
    'streamhub-sdk/content/views/livefyre-content-view',
    'streamhub-sdk/ui/hub-button',
    'inherits',
    'streamhub-sdk/jquery'],
function (LivefyreContentView, HubButton, inherits, $) {
    'use strict';
    
    /**
     * A view for rendering twitter content into an element.
     * @param opts {Object} The set of options to configure this view with (See LivefyreContentView).
     * @exports streamhub-sdk/content/views/twitter-content-view
     * @constructor
     */

    var TwitterContentView = function (opts) {
        LivefyreContentView.call(this, opts);

        this._rendered = false;
    };
    inherits(TwitterContentView, LivefyreContentView);
    
    TwitterContentView.prototype.elClass += ' content-tweet ';

    /**
     * Create and add any buttons that should be on all TwitterContentViews.
     * This will be invoked on construction
     * They will be rendered by ._renderButtons later.
     */
    TwitterContentView.prototype._addInitialButtons = function () {
        var replyButton = new HubButton(undefined, {
            className: 'content-action content-action-reply',
            buttonUrl: 'https://twitter.com/intent/tweet?in_reply_to=' + this.content.tweetId
        });
        var retweetButton = new HubButton(undefined, {
            className: 'content-action content-action-retweet',
            buttonUrl: 'https://twitter.com/intent/retweet?tweet_id=' + this.content.tweetId
        });
        var favoriteButton = new HubButton(undefined, {
            className: 'content-action content-action-favorite',
            buttonUrl: 'https://twitter.com/intent/favorite?tweet_id=' + this.content.tweetId
        });
        LivefyreContentView.prototype._addInitialButtons.apply(this, arguments);

        this.addButton(replyButton);
        this.addButton(retweetButton);
        this.addButton(favoriteButton);
    };

    /**
     * Gets the template rendering context. By default, returns "this.content".
     * @return {Content} The content object this view was instantiated with.
     */
    TwitterContentView.prototype.getTemplateContext = function () {
        var context = LivefyreContentView.prototype.getTemplateContext.call(this);
        if (context && context.author && typeof context.author.profileUrl === 'string') {
            context.author.twitterUsername = context.author.profileUrl.split('/').pop();
        }
        context.authorUrl = '//twitter.com/intent/user?user_id='+context.author.twitterUserId;
        context.authorUserName = context.author.twitterUsername;
        context.authorUserNamePrefix = '@';

        context.contentSourceName = 'twitter';
        context.contentSourceTooltipUrl = '//twitter.com/statuses/'+context.tweetId;
        context.contentSourceTooltipText = 'View on Twitter';

        context.createdAtUrl = context.contentSourceTooltipUrl;

        return context;
    };

    return TwitterContentView;
});
