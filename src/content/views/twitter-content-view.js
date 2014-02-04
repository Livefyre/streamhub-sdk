define([
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/ui/button/hub-button',
    'inherits',
    'streamhub-sdk/jquery'],
function (ContentView, HubButton, inherits, $) {
    'use strict';
    
    /**
     * A view for rendering twitter content into an element.
     * @param opts {Object} The set of options to configure this view with (See ContentView).
     * @exports streamhub-sdk/content/views/twitter-content-view
     * @constructor
     */

    var TwitterContentView = function (opts) {
        ContentView.call(this, opts);

        this._rendered = false;
    };
    inherits(TwitterContentView, ContentView);
    
    TwitterContentView.prototype.elClass += ' content-tweet ';

    TwitterContentView.prototype._setupButtons = function () {
        if (! this._rendered) {
            var replyButton = new HubButton(undefined, {
                className: 'content-action content-action-reply'
            });
            var retweetButton = new HubButton(undefined, {
                className: 'content-action content-action-retweet'
            });
            var favoriteButton = new HubButton(undefined, {
                className: 'content-action content-action-favorite'
            });

            this.addButton(replyButton);
            this.addButton(retweetButton);
            this.addButton(favoriteButton);
        } else {
            for (var i=0; i < this._controls['left'].length; i++) {
                this.addButton(this._controls['left'][i]);
            }
        }

        this._rendered = true;
    };

    /**
     * Gets the template rendering context. By default, returns "this.content".
     * @return {Content} The content object this view was instantiated with.
     */
    TwitterContentView.prototype.getTemplateContext = function () {
        var context = ContentView.prototype.getTemplateContext.call(this);
        if (context && context.author && typeof context.author.profileUrl === 'string') {
            context.author.twitterUsername = context.author.profileUrl.split('/').pop();
        }
        context.authorUrl = '//twitter.com/intent/user?user_id='+context.author.twitterUserId;
        context.authorDisplayName = context.author.displayName;
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
