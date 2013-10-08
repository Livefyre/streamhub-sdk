define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/views/list-view',
    'streamhub-sdk/content/content-view-factory',
    'streamhub-sdk/modal/views/attachment-gallery-modal',
    'inherits',
    'streamhub-sdk/debug',
    'stream/writable',
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/views/streams/more',
    'streamhub-sdk/views/show-more-button',
    'hgn!streamhub-sdk/views/templates/list-view'],
function($, ListView, ContentViewFactory, AttachmentGalleryModal, inherits,
debug, Writable, ContentView, More, ShowMoreButton, ContentListViewTemplate) {
    'use strict';

    var log = debug('streamhub-sdk/content/views/content-list-view');

    /**
     * A simple View that displays Content in a list (`<ul>` by default).
     *
     * @param opts {Object} A set of options to config the view with
     * @param opts.el {HTMLElement} The element in which to render the streamed content
     * @exports streamhub-sdk/views/list-view
     * @constructor
     */
    var ContentListView = function(opts) {
        opts = opts || {};

        this.modal = opts.modal === undefined ? new AttachmentGalleryModal() : opts.modal;
        this.contentViewFactory = opts.contentViewFactory || new ContentViewFactory();

        ListView.call(this, opts);
    };

    inherits(ContentListView, ListView);

    /**
     * Class property to add to ListView instances' .el
     */
    ContentListView.prototype.elClass += ' streamhub-content-list-view';

    /**
     * Set the element that this ContentListView renders in
     * @param element {HTMLElement} The element to render the ContentListView in
     */
    ContentListView.prototype.setElement = function (element) {
        var self = this;
        ListView.prototype.setElement.apply(this, arguments);

        this.$el.on('removeContentView.hub', function(e, content) {
            self.remove(content);
        });
        this.$el.on('focusContent.hub', function(e, context) {
            var contentView = self.getContentView(context.content);
            if (! self.modal) {
                if (contentView &&
                    contentView.attachmentsView &&
                    typeof contentView.attachmentsView.focus === 'function') {
                    contentView.attachmentsView.focus(context.attachmentToFocus);
                }
                return;
            }
            self.modal.show(context.content, { attachment: context.attachmentToFocus });
        });
    };


    /**
     * @private
     * Comparator function to determine ordering of ContentViews.
     * ContentView elements indexes in this.el will be ordered by this
     * By default, order on contentView.content.createdAt or contentView.createdAt
     *     in descending order (new first)
     * @param a {ContentView}
     * @param b {ContentView}
     * @returns {Number} < 0 if a before b, 0 if same ordering, > 0 if b before a
     */
    ContentListView.prototype.comparator = function (a, b) {
        var aDate = a.content.createdAt || a.createdAt,
            bDate = b.content.createdAt || b.createdAt;
        return bDate - aDate;
    };


    /**
     * Add a piece of Content to the ContentListView
     *     .createContentView(content)
     *     add newContentView to this.contentViews[]
     *     render the newContentView
     *     insert the newContentView into this.el according to this.comparator
     * @param content {Content} A Content model to add to the ContentListView
     * @returns the newly created ContentView
     */
    ContentListView.prototype.add = function(content) {
        var contentView = this.getContentView(content);

        log("add", content);

        if (contentView) {
            return contentView;
        }

        contentView = this.createContentView(content);

        return ListView.prototype.add.call(this, contentView);
    };


    /**
     * Remove a piece of Content from this ContentListView
     * @param content {Content|ContentView} The ContentView or Content to be removed
     * @returns {boolean} true if Content was removed, else false
     */
    ContentListView.prototype.remove = function (content) {
        var contentView = content.el ? content : this.getContentView(content); //duck type for ContentView
        return ListView.prototype.remove.call(this, contentView);
    };


    /**
     * Given a new Content instance, return an existing contentView that
     * should be used to update the content (based on identity or content.id).
     * @param newContent {Content} The piece of content to find the view for.
     * @returns {ContentView | null} The contentView for the content, or null.
     */
    ContentListView.prototype.getContentView = function (newContent) {
        for (var i=0; i < this.views.length; i++) {
            var contentView = this.views[i];
            if ((newContent === contentView.content) || (newContent.id && contentView.content.id === newContent.id)) {
                return contentView;
            }
        }
        return null;
    };


    /**
     * Creates a content view from the given piece of content, by looking in this view's
     * content registry for the supplied content type.
     * @param content {Content} A content object to create the corresponding view for.
     * @returns {ContentView} A new content view object for the given piece of content.
     */
    ContentListView.prototype.createContentView = function (content) {
        var view = this.contentViewFactory.createContentView(content);

        if (view && typeof view.render === 'function') {
            view.render();
        }

        return view;
    };


    return ContentListView;
});
