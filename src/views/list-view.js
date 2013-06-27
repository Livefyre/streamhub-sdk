define(['streamhub-sdk/jquery', 'streamhub-sdk/view', 'streamhub-sdk/content/views/content-view'],
function($, View, ContentView) {

    /**
     * A simple View that displays Content in a list (`<ul>` by default).
     * @param opts {Object} A set of options to config the view with
     * @param opts.el {HTMLElement} The element in which to render the streamed content
     * @exports streamhub-sdk/views/list-view
     * @constructor
     */
    var ListView = function(opts) {
        opts = opts || {};
        View.call(this, opts);

        $(this.el).addClass('streamhub-list-view');

        this.contentViews = [];

        var self = this;
    };
    $.extend(ListView.prototype, View.prototype);


    /**
     * Comparator function to determine ordering of ContentViews.
     * ContentView elements indexes in this.el will be ordered by this
     * By default, order on contentView.content.createdAt or contentView.createdAt
     *     in descending order (new first)
     * @param a {ContentView}
     * @param b {ContentView}
     * @return {Number} < 0 if a before b, 0 if same ordering, > 0 if b before a
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
     * @return the newly created ContentView
     */
    ListView.prototype.add = function(content, stream) {
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
     * @private
     * Insert a contentView into the ListView's .el
     * Get insertion index based on this.comparator
     */
    ListView.prototype._insert = function (contentView) {
        var newContentViewIndex,
            $previousEl;

        // Push and sort. #TODO Insert in sorted order
        this.contentViews.push(contentView);
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
     * should be used to update the content (based on content.id).
     * @param newContent {Content} The piece of content to find the view for.
     * @returns {ContentView | null} The contentView for the content, or null.
     */
    ListView.prototype.getContentView = function (newContent) {
        var existingContentView;
        for (var i=0; i < this.contentViews.length; i++) {
            var contentView = this.contentViews[i];
            if (newContent.id && contentView.content.id === newContent.id) {
                return contentView;
            }
        }
        return null;
    };

    return ListView;
});
