'use strict';

var auth = require('auth');
var Content = require('streamhub-sdk/content');
var LivefyreContent = require('streamhub-sdk/content/types/livefyre-content');
var LivefyreTwitterContent = require('streamhub-sdk/content/types/livefyre-twitter-content');
var LivefyreFacebookContent = require('streamhub-sdk/content/types/livefyre-facebook-content');
var LivefyreInstagramContent = require('streamhub-sdk/content/types/livefyre-instagram-content');
var LivefyreUrlContent = require('streamhub-sdk/content/types/livefyre-url-content');
var TwitterContent = require('streamhub-sdk/content/types/twitter-content');
var ContentView = require('streamhub-sdk/content/views/card-content-view');
var LivefyreContentView = require('streamhub-sdk/content/views/livefyre-content-view');
var TwitterContentView = require('streamhub-sdk/content/views/twitter-content-view');
var FacebookContentView = require('streamhub-sdk/content/views/facebook-content-view');
var InstagramContentView = require('streamhub-sdk/content/views/instagram-content-view');
var UrlContentView = require('streamhub-sdk/content/views/url-content-view');

var Command = require('streamhub-sdk/ui/command');
var Liker = require('streamhub-sdk/collection/liker');
var CompositeView = require('view/composite-view');
var TiledAttachmentListView = require('streamhub-sdk/content/views/tiled-attachment-list-view');
var BlockAttachmentListView = require('streamhub-sdk/content/views/block-attachment-list-view');
var TYPE_URNS = require('streamhub-sdk/content/types/type-urns');

/**
 * A module to create instances of ContentView for a given Content instance.
 * @exports streamhub-sdk/content-view-factory
 * @constructor
 */
var ContentViewFactory = function(opts) {
    opts = opts || {};
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
    { type: LivefyreTwitterContent, view: TwitterContentView,
        typeUrn: TYPE_URNS.LIVEFYRE_TWITTER },
    { type: LivefyreFacebookContent, view: FacebookContentView,
        typeUrn: TYPE_URNS.LIVEFYRE_FACEBOOK},
    { type: LivefyreInstagramContent, view: InstagramContentView,
        typeUrn: TYPE_URNS.LIVEFYRE_INSTAGRAM },
    { type: TwitterContent, view: TwitterContentView,
        typeUrn: TYPE_URNS.TWITTER },
    { type: LivefyreUrlContent, view: UrlContentView,
        typeUrn: TYPE_URNS.LIVEFYRE_URL },
    { type: LivefyreContent, view: LivefyreContentView,
        typeUrn: TYPE_URNS.LIVEFYRE },
    { type: Content, view: ContentView,
        typeUrn: TYPE_URNS.CONTENT }
];

ContentViewFactory.prototype._createAttachmentsView = function (content) {
    var opts = { content: content };
    return new CompositeView(new TiledAttachmentListView(opts), new BlockAttachmentListView(opts))
};

/**
 * Creates a content view from the given piece of content, by looking in this view's
 * content registry for the supplied content type.
 * @param content {Content} A content object to create the corresponding view for.
 * @param opts {object} Options for displaying specific controls on the content view.
 * @returns {ContentView} A new content view object for the given piece of content.
 */
ContentViewFactory.prototype.createContentView = function(content, opts) {
    opts = opts || {};
    var ContentViewType = this._getViewTypeForContent(content);
    var attachmentsView = this._createAttachmentsView(content);

    var likeCommand = opts.likeCommand || this._createLikeCommand(content, opts.liker);
    var shareCommand = opts.shareCommand || this._createShareCommand(content, opts.sharer);

    var contentView = new ContentViewType({
        content: content,
        attachmentsView: opts.attachmentsView,
        likeCommand: likeCommand,
        shareCommand: shareCommand,
        useSingleMediaView: this._useSingleMediaView,
        _i18n: opts._i18n
    });

    return contentView;
};

ContentViewFactory.prototype._createLikeCommand = function (content, liker) {
    if (! liker) {
        liker = new Liker();
    }
    var likeCommand = new Command(function (errback) {
        if (! content.isLiked(auth.get('livefyre').get('id'))) {
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

ContentViewFactory.prototype._getViewTypeForContent = function (content) {
    var viewToRender = null;

    for (var i=0, len=this.contentRegistry.length; i < len; i++) {
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
    if ( ! sharer) {
        return;
    }

    if (sharer instanceof Command) {
        return sharer;
    }

    var hasDelegate = typeof sharer.hasDelegate === 'function';
    if (hasDelegate && ! sharer.hasDelegate()) {
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

module.exports = ContentViewFactory;
