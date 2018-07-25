'use strict';

var auth = require('auth');
var BlockAttachmentListView = require('streamhub-sdk/content/views/block-attachment-list-view');
var CardContentViewMixin = require('streamhub-sdk/content/views/mixins/card-content-view-mixin');
var Command = require('streamhub-sdk/ui/command');
var CompositeView = require('view/composite-view');
var Content = require('streamhub-sdk/content');
var ContentView = require('streamhub-sdk/content/views/card-content-view');
var FacebookContentView = require('streamhub-sdk/content/views/facebook-content-view');
var FacebookContentViewMixin = require('streamhub-sdk/content/views/mixins/facebook-content-view-mixin');
var FeedContentView = require('streamhub-sdk/content/views/feed-content-view');
var InstagramContentView = require('streamhub-sdk/content/views/instagram-content-view');
var InstagramContentViewMixin = require('streamhub-sdk/content/views/mixins/instagram-content-view-mixin');
var Liker = require('streamhub-sdk/collection/liker');
var LivefyreContent = require('streamhub-sdk/content/types/livefyre-content');
var LivefyreContentView = require('streamhub-sdk/content/views/livefyre-content-view');
var LivefyreContentViewMixin = require('streamhub-sdk/content/views/mixins/livefyre-content-view-mixin');
var LivefyreFacebookContent = require('streamhub-sdk/content/types/livefyre-facebook-content');
var LivefyreFeedContent = require('streamhub-sdk/content/types/livefyre-feed-content');
var LivefyreInstagramContent = require('streamhub-sdk/content/types/livefyre-instagram-content');
var LivefyreTwitterContent = require('streamhub-sdk/content/types/livefyre-twitter-content');
var LivefyreUrlContent = require('streamhub-sdk/content/types/livefyre-url-content');
var LivefyreWeiboContent = require('streamhub-sdk/content/types/livefyre-weibo-content');
var LivefyreYoutubeContent = require('streamhub-sdk/content/types/livefyre-youtube-content');
var ThemeMixin = require('streamhub-sdk/content/views/mixins/theme-mixin');
var TiledAttachmentListView = require('streamhub-sdk/content/views/tiled-attachment-list-view');
var TumblrContentView = require('streamhub-sdk/content/views/tumblr-content-view');
var TwitterContent = require('streamhub-sdk/content/types/twitter-content');
var TwitterContentView = require('streamhub-sdk/content/views/twitter-content-view');
var TwitterContentViewMixin = require('streamhub-sdk/content/views/mixins/twitter-content-view-mixin');
var TYPE_URNS = require('streamhub-sdk/content/types/type-urns');
var UrlContentView = require('streamhub-sdk/content/views/url-content-view');
var UrlContentViewMixin = require('streamhub-sdk/content/views/mixins/url-content-view-mixin');
var WeiboContentView = require('streamhub-sdk/content/views/weibo-content-view');
var WeiboContentViewMixin = require('streamhub-sdk/content/views/mixins/weibo-content-view-mixin');
var YoutubeContentView = require('streamhub-sdk/content/views/youtube-content-view');

/**
 * A module to create instances of ContentView for a given Content instance.
 * @exports streamhub-sdk/content-view-factory
 * @constructor
 */
var ContentViewFactory = function (opts) {
    opts = opts || {};
    this.showExpandButton = opts.showExpandButton;
    this.contentRegistry = this.contentRegistry.slice(0);
    if (opts.createAttachmentsView) {
        this._createAttachmentsView = opts.createAttachmentsView;
    }
    this._useSingleMediaView = false || opts.useSingleMediaView;
};

/**
 * The default registry for Content -> ContentView rendering.
 * Expects entries to always contain a "type" property, and either a view property
 * (the type function itself) or a viewFunction property (a function that returns a
 * type function, useful for conditional view selection.).
 */
ContentViewFactory.prototype.contentRegistry = [
    {
        type: LivefyreTwitterContent, view: TwitterContentView,
        typeUrn: TYPE_URNS.LIVEFYRE_TWITTER, mixin: TwitterContentViewMixin
    },
    {
        type: LivefyreFacebookContent, view: FacebookContentView,
        typeUrn: TYPE_URNS.LIVEFYRE_FACEBOOK, mixin: FacebookContentViewMixin
    },
    {
        type: LivefyreInstagramContent, view: InstagramContentView,
        typeUrn: TYPE_URNS.LIVEFYRE_INSTAGRAM, mixin: InstagramContentViewMixin
    },
    {
        type: LivefyreFeedContent, view: FeedContentView,
        typeUrn: TYPE_URNS.LIVEFYRE_FEED, mixin: TwitterContentViewMixin
    },
    {
        type: TwitterContent, view: TwitterContentView,
        typeUrn: TYPE_URNS.TWITTER, mixin: TwitterContentViewMixin
    },
    {
        type: LivefyreUrlContent, view: UrlContentView,
        typeUrn: TYPE_URNS.LIVEFYRE_URL, mixin: UrlContentViewMixin
    },
    {
        type: LivefyreContent, view: LivefyreContentView,
        typeUrn: TYPE_URNS.LIVEFYRE, mixin: LivefyreContentViewMixin
    },
    {
        type: Content, view: ContentView,
        typeUrn: TYPE_URNS.CONTENT, mixin: CardContentViewMixin
    },
    {
        type: LivefyreWeiboContent, view: WeiboContentView,
        typeUrn: TYPE_URNS.LIVEFYRE_WEIBO, mixin: WeiboContentViewMixin
    },
    {
        type: LivefyreYoutubeContent, view: YoutubeContentView,
        typeUrn: TYPE_URNS.LIVEFYRE_YOUTUBE, mixin: function (view) {return ThemeMixin(view, 'content-youtube')}
    }
];

ContentViewFactory.prototype._createAttachmentsView = function (content, opts) {
    opts = opts || {};
    var cfg = {
        content: content,
        doNotTrack: opts.doNotTrack,
        showMask: opts.showMask
    };
    return new CompositeView(new TiledAttachmentListView(cfg), new BlockAttachmentListView(cfg));
};

/**
 * Creates a content view from the given piece of content, by looking in this view's
 * content registry for the supplied content type.
 * @param content {Content} A content object to create the corresponding view for.
 * @param opts {object} Options for displaying specific controls on the content view.
 * @returns {ContentView} A new content view object for the given piece of content.
 */
ContentViewFactory.prototype.createContentView = function (content, opts) {
    opts = opts || {};

    var attachmentsView = this._createAttachmentsView(content, opts);
    var ContentViewType = this._getViewTypeForContent(content, opts);
    var likeCommand = opts.likeCommand || this._createLikeCommand(content, opts.liker);
    var shareCommand = opts.shareCommand || this._createShareCommand(content, opts.sharer);

    return new ContentViewType({
        attachmentsView: opts.attachmentsView,
        content: content,
        doNotTrack: opts.doNotTrack || {},
        expandCommand: opts.expandCommand,
        likeCommand: likeCommand,
        productOptions: opts.productOptions || {},
        shareCommand: shareCommand,
        showCTA: opts.showCTA,
        showExpandButton: this.showExpandButton,
        showMask: opts.showMask,
        useSingleMediaView: this._useSingleMediaView,
        spectrum: opts.spectrum
    });
};

ContentViewFactory.prototype._createLikeCommand = function (content, liker) {
    if (!liker) {
        liker = new Liker();
    }
    var likeCommand = new Command(function (errback) {
        if (!content.isLiked(auth.get('livefyre').get('id'))) {
            liker.like(content, errback);
        } else {
            liker.unlike(content, errback);
        }
    });

    var livefyreUser = auth.get('livefyre');
    if (livefyreUser && content.author && content.author.id === livefyreUser.get('id')) {
        likeCommand.disable();
    }

    return likeCommand;
};

ContentViewFactory.prototype._getViewTypeForContent = function (content, opts) {
    opts = opts || {};
    var viewToRender = null;

    // If rights are granted, use the Livefyre view because it has no social
    // branding or extra social features like footer buttons.
    if (opts.hideSocialBrandingWithRights && content.hasRightsGranted()) {
        return LivefyreContentView;
    }

    for (var i = 0, len = this.contentRegistry.length; i < len; i++) {
        var current = this.contentRegistry[i];
        var sameTypeUrn = content.typeUrn && (current.typeUrn === content.typeUrn);

        if (!sameTypeUrn) {
            continue;
        }

        if (content.typeUrn === TYPE_URNS.LIVEFYRE_URL) {
            var typeId = content.urlContentTypeId || "";
            typeId = typeId.toLowerCase();

            //Set urn so that other bits that rely on it
            //treat content as it should be.
            if (typeId.indexOf("twitter.com") >= 0) {
                viewToRender = TwitterContentView;
            }

            if (!viewToRender && typeId.indexOf("facebook.com") >= 0) {
                viewToRender = FacebookContentView;
            }

            if (!viewToRender && typeId.indexOf("instagram.com") >= 0) {
                viewToRender = InstagramContentView;
            }
        }

        if (content.typeUrn === TYPE_URNS.LIVEFYRE_FEED) {
            var feedUrl = (content.feedUrl || '').toLowerCase();
            if (feedUrl.indexOf("youtube.com") >= 0) {
                viewToRender = YoutubeContentView;
            }

            if (feedUrl.indexOf("tumblr.com") >= 0) {
                viewToRender = TumblrContentView;
            }
        }

        if (viewToRender) {
            return viewToRender;
        }

        if (current.view) {
            viewToRender = current.view;
        } else if (current.viewFunction) {
            viewToRender = current.viewFunction(content);
        }
        return viewToRender;
    }
};

/**
 * Given content and a sharer, create a Command to pass as
 * @param sharer {function|Sharer} Object or Function to share with
 * opts.shareCommand to the ContentView
 */
ContentViewFactory.prototype._createShareCommand = function (content, sharer) {
    if (!sharer) {
        return;
    }

    if (sharer instanceof Command) {
        return sharer;
    }

    var hasDelegate = typeof sharer.hasDelegate === 'function';
    if (hasDelegate && !sharer.hasDelegate()) {
        return;
    }

    var shareCommand;
    if (typeof sharer === 'function') {
        shareCommand = new Command(function () {
            sharer(content);
        });
    } else {
        shareCommand = new Command(function () {
            sharer.share(content);
        });
    }

    shareCommand.canExecute = function () {
        if (typeof sharer.canShare !== 'function') {
            return true;
        }
        return sharer.canShare(content);
    }
    // TODO: When the sharer's delegate changes and it didn't have one before,
    // then the shareCommand should emit change:canExecute
    return shareCommand;
};

ContentViewFactory.prototype.getMixinForTypeOfContent = function (content, opts) {
    opts = opts || {};
    var viewToRender = null;

    // If rights are granted, use the Livefyre mixin because it has no social
    // branding or extra social features like footer buttons.
    if (opts.hideSocialBrandingWithRights && content.hasRightsGranted()) {
        return LivefyreContentViewMixin;
    }

    for (var i = 0, len = this.contentRegistry.length; i < len; i++) {
        var current = this.contentRegistry[i];
        var sameTypeUrn = content.typeUrn && (current.typeUrn === content.typeUrn);

        if (!sameTypeUrn) {
            continue;
        }

        if (content.typeUrn === TYPE_URNS.LIVEFYRE_URL) {
            var typeId = content.urlContentTypeId || "";
            typeId = typeId.toLowerCase();

            //Set urn so that other bits that rely on it
            //treat content as it should be.
            if (typeId.indexOf("twitter.com") >= 0) {
                return TwitterContentViewMixin;
            } else if (typeId.indexOf("facebook.com") >= 0) {
                return FacebookContentViewMixin;
            } else if (typeId.indexOf("instagram.com") >= 0) {
                return InstagramContentViewMixin;
            }
        } else if (content.typeUrn === TYPE_URNS.LIVEFYRE_FEED) {
            var feedUrl = (content.feedUrl || '').toLowerCase();
            if (feedUrl.indexOf("youtube.com") >= 0) {
                return function (view) {return ThemeMixin(view, 'content-youtube')};
            } else if (feedUrl.indexOf("tumblr.com") >= 0) {
                return function (view) {return ThemeMixin(view, 'content-tumblr')};
            }
        }

        if (current.mixin) {
            return current.mixin;
        }
    }
};

module.exports = ContentViewFactory;
