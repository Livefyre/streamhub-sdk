define([
    'auth',
    'streamhub-sdk/content',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-twitter-content',
    'streamhub-sdk/content/types/livefyre-facebook-content',
    'streamhub-sdk/content/types/livefyre-instagram-content',
    'streamhub-sdk/content/types/twitter-content',
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/content/views/tiled-attachment-list-view',
    'streamhub-sdk/content/views/livefyre-content-view',
    'streamhub-sdk/content/views/twitter-content-view',
    'streamhub-sdk/content/views/facebook-content-view',
    'streamhub-sdk/content/views/instagram-content-view',
    'streamhub-sdk/content/views/gallery-on-focus-view',
    'streamhub-sdk/ui/command',
    'streamhub-share',
    'streamhub-sdk/collection/liker'
], function(
    auth,
    Content,
    LivefyreContent,
    LivefyreTwitterContent,
    LivefyreFacebookContent,
    LivefyreInstagramContent,
    TwitterContent,
    ContentView,
    TiledAttachmentListView,
    LivefyreContentView,
    TwitterContentView,
    FacebookContentView,
    InstagramContentView,
    GalleryOnFocusView,
    Command,
    ShareButton,
    Liker
) {
    'use strict';

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
    };

    /**
     * The default registry for Content -> ContentView rendering.
     * Expects entries to always contain a "type" property, and either a view property
     * (the type function itself) or a viewFunction property (a function that returns a
     * type function, useful for conditional view selection.).
     */
    ContentViewFactory.prototype.contentRegistry = [
        { type: LivefyreTwitterContent, view: TwitterContentView,
            typeUrn: 'urn:livefyre:js:streamhub-sdk:content:types:livefyre-twitter' },
        { type: LivefyreFacebookContent, view: FacebookContentView,
            typeUrn: 'urn:livefyre:js:streamhub-sdk:content:types:livefyre-facebook' },
        { type: LivefyreInstagramContent, view: InstagramContentView,
            typeUrn: 'urn:livefyre:js:streamhub-sdk:content:types:livefyre-instagram' },
        { type: TwitterContent, view: TwitterContentView,
            typeUrn: 'urn:livefyre:js:streamhub-sdk:content:types:twitter' },
        { type: LivefyreContent, view: LivefyreContentView,
            typeUrn: 'urn:livefyre:js:streamhub-sdk:content:types:livefyre' },
        { type: Content, view: ContentView,
            typeUrn: 'urn:livefyre:js:streamhub-sdk:content' }
    ];

    /**
     * Creates a content view from the given piece of content, by looking in this view's
     * content registry for the supplied content type.
     * @param content {Content} A content object to create the corresponding view for.
     * @param opts {object} Options for displaying specific controls on the content view.
     * @returns {ContentView} A new content view object for the given piece of content.
     */
    ContentViewFactory.prototype.createContentView = function(content, opts) {
        opts = opts || {};
        var contentView,
            ContentViewType = this._getViewTypeForContent(content),
            attachmentsView = this._createAttachmentsView(content),
            cvOpts = {
                content: content,
                attachmentsView: attachmentsView
            };

        cvOpts.likeCommand = opts.likeCommand || this._createLikeCommand(content, opts.liker);
        cvOpts.shareCommand = opts.shareCommand || this._createShareCommand(content, opts.sharer);
        
        contentView = new ContentViewType(cvOpts);
        !cvOpts.shareCommand && contentView.addButton(new ShareButton({content: content}));

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
        for (var i=0, len=this.contentRegistry.length; i < len; i++) {
            var current = this.contentRegistry[i];
            var sameTypeUrn = content.typeUrn && (current.typeUrn === content.typeUrn);
            if (! (sameTypeUrn || (content instanceof current.type))) {
                continue;
            }

            var currentType;
            if (current.view) {
                currentType = current.view;
            } else if (current.viewFunction) {
                currentType = current.viewFunction(content);
            }
            return currentType;
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

        var hasHasDelegate = typeof sharer.hasDelegate === 'function';
        if (hasHasDelegate && ! sharer.hasDelegate()) {
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

    ContentViewFactory.prototype._createAttachmentsView = function (content) {
        var tiledAttachmentListView = new TiledAttachmentListView();
        return new GalleryOnFocusView(tiledAttachmentListView, {
            content: content
        });
    };

    return ContentViewFactory;
});
