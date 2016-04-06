var HubButton = require('streamhub-sdk/ui/hub-button');
var hasFooterButtons = require('streamhub-sdk/content/views/mixins/footer-buttons-mixin');

'use strict';

/**
 * A mixin that decorates an instance of ContentView 
 * to render as a TwitterContentView.
 * TwitterContentViews have twitter web intent buttons (e.g. retweeet),
 * and hyperlinks according to twitter display requirements.
 */
function asTwitterContentView(contentView, opts) {
    opts = opts || {};
    var elClass = opts.elClass || 'content-tweet';
    contentView.$el.addClass(elClass);
    hasFooterButtons(contentView);

    /**
     * Render the content inside of the LivefyreContentView's element.
     * @returns {LivefyreContentView}
     */
    var oldRender = contentView.render;
    contentView.render = function () {
        oldRender.apply(contentView, arguments);
        contentView.$el.addClass(elClass);
    };

    var oldFooterGetTemplateContext = contentView._footerView.getTemplateContext;
    contentView._footerView.getTemplateContext = function () {
        var context = oldFooterGetTemplateContext.apply(contentView._footerView, arguments);
        context.createdAtUrl = '//twitter.com/statuses/'+context.tweetId;
        return context;
    };

    contentView._addInitialButtons = function () {
        var expandButton = new HubButton(undefined, {
            className: 'content-action content-action-expand',
            buttonUrl: '#'
        });
        var replyButton = new HubButton(undefined, {
            className: 'content-action content-action-reply',
            buttonUrl: 'https://twitter.com/intent/tweet?in_reply_to=' + contentView.content.tweetId
        });
        var retweetButton = new HubButton(undefined, {
            className: 'content-action content-action-retweet',
            buttonUrl: 'https://twitter.com/intent/retweet?tweet_id=' + contentView.content.tweetId
        });
        var favoriteButton = new HubButton(undefined, {
            className: 'content-action content-action-favorite',
            buttonUrl: 'https://twitter.com/intent/favorite?tweet_id=' + contentView.content.tweetId
        });

        contentView.addButton(expandButton);
        contentView.addButton(replyButton);
        contentView.addButton(retweetButton);
        contentView.addButton(favoriteButton);
    };

    // init
    contentView._addInitialButtons();
};

module.exports = asTwitterContentView;
