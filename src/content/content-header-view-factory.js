var ContentHeaderView = require('streamhub-sdk/content/views/content-header-view');
var TYPE_URNS = require('streamhub-sdk/content/types/type-urns');
var util = require('streamhub-sdk/content/util/main');

'use strict';

/**
 * Object which knows how to create the appropriate ContentHeaderView
 * for different Content Types.
 * Specifically, Facebook, Twitter, and the rest have different display
 * requirements.
 */
function ContentHeaderViewFactory() {}

ContentHeaderViewFactory.prototype.createHeaderView = function (content) {
    return new ContentHeaderView(this.getHeaderViewOptsForContent(content));
};

ContentHeaderViewFactory.prototype.getHeaderViewOptsForContent = function (content) {
    var opts = {};
    opts.author =  content.author;

    // It's possible that the displayName is empty or it's just not set.
    // If that is the case, try to fill it with either the handle or the
    // last part of the profileUrl.
    if (content.author && !content.author.displayName) {
        if (content.author.handle) {
            opts.author.displayName = content.author.handle;
        } else if (typeof content.author.profileUrl === 'string') {
            opts.author.displayName = content.author.profileUrl.split('/').pop();
        }
    }

    if (content.typeUrn === TYPE_URNS.LIVEFYRE_TWITTER || content.typeUrn === TYPE_URNS.TWITTER) {
        if (content.author && typeof content.author.profileUrl === 'string') {
            opts.authorUserNamePrefix = '@';
            opts.authorUserName = content.author.profileUrl.split('/').pop();
            opts.authorUrl = 'https://twitter.com/intent/user?user_id=' + content.author.twitterUserId;
        }
        opts.authorVerified = content.twitterVerified;
        opts.contentSourceName = 'twitter';
        opts.contentSourceUrl = 'https://twitter.com';
        opts.contentSourceTooltipText = 'Twitter Homepage';
    } else if (content.typeUrn === TYPE_URNS.LIVEFYRE_FACEBOOK) {
        if (content.author) {
            opts.authorUrl = content.author.profileUrl;
        }
        opts.contentSourceName = 'facebook'
        opts.contentSourceUrl = 'https://facebook.com';
        opts.contentSourceTooltipText = 'Facebook Homepage';
    } else if (content.typeUrn === TYPE_URNS.LIVEFYRE_INSTAGRAM) {
        if (content.author && typeof content.author.profileUrl === 'string') {
            opts.authorUserNamePrefix = '@';
            opts.authorUserName = content.author.handle;
            opts.authorUrl = content.author.profileUrl;
        }
        opts.contentSourceName = 'instagram';
        opts.contentSourceUrl = 'https://instagram.com';
        opts.contentSourceTooltipText = 'Instagram Homepage';
    } else if (content.typeUrn === TYPE_URNS.LIVEFYRE_WEIBO) {
        opts.contentSourceName = 'weibo';
        opts.contentSourceUrl = 'http://weibo.com/';
        opts.contentSourceTooltipText = 'Weibo Homepage';
    } else if (content.typeUrn === TYPE_URNS.LIVEFYRE_YOUTUBE) {
        opts.contentSourceName = 'youtube';
        opts.contentSourceUrl = 'https://youtube.com';
        opts.contentSourceTooltipText = 'YouTube Homepage';
    } else if (content.typeUrn === TYPE_URNS.LIVEFYRE_FEED) {
        opts.contentSourceName = 'rss';
    } else if (content.typeUrn === TYPE_URNS.LIVEFYRE) {
        opts.contentSourceName = 'livefyre';
    }

    opts.createdAt = content.createdAt;
    opts.createdAtUrl = util.getContentPermalink(opts.contentSourceName, content);
    return opts;
};

module.exports = ContentHeaderViewFactory;
