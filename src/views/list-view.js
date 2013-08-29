define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/view',
    'streamhub-sdk/content/content-view-factory',
    'streamhub-sdk/util'],
function($, View, ContentViewFactory, util) {

    /**
     * A simple View that displays Content in a list (`<ul>` by default).
     *
     * @param opts {Object} A set of options to config the view with
     * @param opts.el {HTMLElement} The element in which to render the streamed content
     * @exports streamhub-sdk/views/list-view
     * @constructor
     */
    var ListView = function(opts) {
        opts = opts || {};
        this.modal = opts.modal;
        View.call(this, opts);

        $(this.el).addClass('streamhub-list-view');

        this.contentViewFactory = new ContentViewFactory();
        this.contentViews = [];

        var self = this;
        $(this.el).on('removeContentView.hub', function(e, content) {
            self.remove(content);
        });
        $(this.el).on('focusContent.hub', function(e, context) {
            if (!self.modal) {
                return;
            }
            self.modal.setFocus(context.content, { attachment: context.attachmentToFocus });
            self.modal.show();
        });
    };
    util.inherits(ListView, View);

    /**
     * Comparator function to determine ordering of ContentViews.
     * ContentView elements indexes in this.el will be ordered by this
     * By default, order on contentView.content.createdAt or contentView.createdAt
     *     in descending order (new first)
     * @param a {ContentView}
     * @param b {ContentView}
     * @returns {Number} < 0 if a before b, 0 if same ordering, > 0 if b before a
     */
    ListView.prototype.comparator = function (a, b) {
        var aDate = a.content.createdAt || a.createdAt,
            bDate = b.content.createdAt || b.createdAt;
        return bDate - aDate;
    };


    /**
     * Add a piece of Content to the ListView
     *     .createContentView(content)
     *     add newContentView to this.contentViews[]
     *     render the newContentView
     *     insert the newContentView into this.el according to this.comparator
     * @param content {Content} A Content model to add to the ListView
     * @returns the newly created ContentView
     */
    ListView.prototype.add = function(content) {
        var contentView = this.getContentView(content);

        if (contentView) {
            return contentView;
        }

        contentView = this.createContentView(content);
        contentView.render();

        // Add to DOM
        this._insert(contentView);

        return contentView;
    };


    /**
     * Remove a piece of Content from this ListView
     * @param content {Content|ContentView} The ContentView or Content to be removed
     * @returns {boolean} true if Content was removed, else false
     */
    ListView.prototype.remove = function (content) {
        var contentView = content.el ? content : this.getContentView(content); //duck type for ContentView
        if (! contentView) {
            return false;
        }
        contentView.$el.remove();
        // Remove from this.contentViews[]
        this.contentViews.splice(this.contentViews.indexOf(contentView), 1);
        return true;
    };


    /**
     * Insert a contentView into the ListView's .el
     * Get insertion index based on this.comparator
     * @private
     */
    ListView.prototype._insert = function (contentView) {
        var newContentViewIndex,
            $previousEl;

        // Push and sort. #TODO Insert in sorted order
        if (this.contentViews.indexOf(contentView) === -1) {
            this.contentViews.push(contentView);
        }
        this.contentViews.sort(this.comparator);

        newContentViewIndex = this.contentViews.indexOf(contentView);

        if (newContentViewIndex === 0) {
            // Beginning!
            contentView.$el.prependTo(this.el);
        } else {
            // Find it's previous contentView and insert new contentView after
            $previousEl = this.contentViews[newContentViewIndex - 1].$el;
            contentView.$el.insertAfter($previousEl);
        }
    };


    /**
     * Given a new Content instance, return an existing contentView that
     * should be used to update the content (based on identity or content.id).
     * @param newContent {Content} The piece of content to find the view for.
     * @returns {ContentView | null} The contentView for the content, or null.
     */
    ListView.prototype.getContentView = function (newContent) {
        var existingContentView;
        for (var i=0; i < this.contentViews.length; i++) {
            var contentView = this.contentViews[i];
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
    ListView.prototype.createContentView = function(content) {
        return this.contentViewFactory.createContentView(content);
    };

    return ListView;
});
