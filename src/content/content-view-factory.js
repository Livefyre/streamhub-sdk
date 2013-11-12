var Content = require('streamhub-sdk/content');
var LivefyreContent = require('streamhub-sdk/content/types/livefyre-content');
var LivefyreTwitterContent = require('streamhub-sdk/content/types/livefyre-twitter-content');
var LivefyreFacebookContent = require('streamhub-sdk/content/types/livefyre-facebook-content');
var LivefyreInstagramContent = require('streamhub-sdk/content/types/livefyre-instagram-content');
var TwitterContent = require('streamhub-sdk/content/types/twitter-content');
var ContentView = require('streamhub-sdk/content/views/content-view');
var TiledAttachmentListView = require('streamhub-sdk/content/views/tiled-attachment-list-view');
var TwitterContentView = require('streamhub-sdk/content/views/twitter-content-view');
var FacebookContentView = require('streamhub-sdk/content/views/facebook-content-view');
var InstagramContentView = require('streamhub-sdk/content/views/instagram-content-view');
var GalleryOnFocusView = require('streamhub-sdk/content/views/gallery-on-focus-view');

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
    { type: LivefyreTwitterContent, view: TwitterContentView },
    { type: LivefyreFacebookContent, view: FacebookContentView },
    { type: LivefyreInstagramContent, view: InstagramContentView },
    { type: TwitterContent, view: TwitterContentView },
    { type: LivefyreContent, view: ContentView },
    { type: Content, view: ContentView }
];

/**
 * Creates a content view from the given piece of content, by looking in this view's
 * content registry for the supplied content type.
 * @param content {Content} A content object to create the corresponding view for.
 * @returns {ContentView} A new content view object for the given piece of content.
 */
ContentViewFactory.prototype.createContentView = function(content) {
    var ContentViewType = this._getViewTypeForContent(content);
    var attachmentsView = this._createAttachmentsView(content);
    var contentView = new ContentViewType({ content : content, attachmentsView: attachmentsView });

    return contentView;
};


ContentViewFactory.prototype._getViewTypeForContent = function (content) {
    for (var i=0, len=this.contentRegistry.length; i < len; i++) {
        var current = this.contentRegistry[i];
        if (!(content instanceof current.type)) {
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


ContentViewFactory.prototype._createAttachmentsView = function (content) {
    var tiledAttachmentListView = new TiledAttachmentListView();
    return new GalleryOnFocusView(tiledAttachmentListView, {
        content: content
    });
};

module.exports = ContentViewFactory;
