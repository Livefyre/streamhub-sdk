var ContentHeaderView = require('streamhub-sdk/content/views/content-header-view');
var TYPE_URNS = require('streamhub-sdk/content/types/type-urns');

'use strict';

/**
 * Object which knows how to create the appropriate ContentHeaderView
 * for different Content Types.
 * Specifically, Facebook, Twitter, and the rest have different display
 * requirements.
 */
var ContentHeaderViewFactory = function (opts) {
    opts = opts || {};
};

ContentHeaderViewFactory.prototype.createHeaderView = function (content) {
    var opts = this._getHeaderViewOptsForContent(content);
    return new ContentHeaderView(opts);
};

ContentHeaderViewFactory.prototype._getHeaderViewOptsForContent = function (content) {
    var opts = {};
    opts.author =  content.author;


    if (content.typeUrn === TYPE_URNS.LIVEFYRE_TWITTER || content.typeUrn === TYPE_URNS.TWITTER) {
        if (content.author && typeof content.author.profileUrl === 'string') {
            opts.authorUserNamePrefix = '@';
            opts.authorUserName = content.author.profileUrl.split('/').pop();
            opts.authorUrl = '//twitter.com/intent/user?user_id='+content.author.twitterUserId;
        }
        opts.authorVerified = content.twitterVerified;
        opts.contentSourceName = 'twitter';
        opts.contentSourceUrl = '//twitter.com';
    } else if (content.typeUrn === TYPE_URNS.LIVEFYRE_FACEBOOK) {
        if (content.author) {
            opts.authorUserNamePrefix = '@';
            opts.authorUrl = content.author.profileUrl;
        }
        opts.contentSourceName = 'facebook';
        opts.contentSourceUrl = '//facebook.com';
        opts.contentSourceTooltipText = 'View on Facebook';
    } else if (content.typeUrn === TYPE_URNS.LIVEFYRE_INSTAGRAM ) {
        if (content.author) {
            opts.authorUserNamePrefix = '@';
            opts.authorUrl = content.author.profileUrl;
        }
        opts.authorUserName = content.author.profileUrl.split('/').pop();
        opts.contentSourceName = 'instagram';
        opts.contentSourceUrl = '//instagram.com';
    }

    return opts;
};

module.exports = ContentHeaderViewFactory;
