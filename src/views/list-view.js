define([
    'inherits',
    'streamhub-sdk/debug',
    'stream/writable',
    'stream/transform',
    'streamhub-sdk/view',
    'streamhub-sdk/jquery',
    'streamhub-sdk/content/views/content-view'],
function(inherits, debug, Writable, Transform, View, $, ContentView) {
    var log = debug('streamhub-sdk/views/list-view');

    /**
     * A simple View that displays Content in a list (`<ul>` by default).
     * @param opts {Object} A set of options to config the view with
     * @param opts.el {HTMLElement} The element in which to render the streamed content
     * @exports streamhub-sdk/views/list-view
     * @constructor
     */
    var ListView = function(opts) {
        var self = this;
        opts = opts || {};

        $(this.el).addClass('streamhub-list-view');

        this.contentViews = [];

        this._showMoreBuffer = opts.ShowMoreBuffer || this._createShowMoreBuffer(opts);
        this._showMoreBuffer.on('data', function (content) {
            log('_showMoreBuffer on data. Adding to view', content);
            self.add(content);
        })
        View.call(this, opts);
        Writable.call(this, opts);
    };

    inherits(ListView, View);
    inherits.parasitically(ListView, Writable);


    /**
     * Called automatically by the Writable base class
     */
    ListView.prototype._write = function (content, requestMore) {
        log('._write', content);
        var writeResult = this._showMoreBuffer.write(content);
        if (writeResult) {
            more();
        } else {
            this._showMoreBuffer.on('drain', more);
        }
        function more () {
            log("_write calling requestMore")
            requestMore()
        }
    };


    ListView.prototype._createShowMoreBuffer = function (opts) {
        opts = opts || {};
        return new ShowMoreBuffer({
            highWaterMark: 0,
            goal: opts.initial || 50
        });
    };


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
    ListView.prototype.add = function(content) {
        var contentView = this.getContentView(content);

        if (contentView) {
            return contentView;
        }

        contentView = this.createContentView(content);
        if ( ! contentView) {
            return;
        }

        contentView.render();

        // Add to DOM
        this._insert(contentView);

        return contentView;
    };


    /**
     * Show More content.
     * ListView keeps track of an internal ._newContentGoal
     *     which is how many more items he wishes he had.
     *     This increases that goal and marks the Writable
     *     side of ListView as ready for more writes.
     * @param numToShow {number} The number of items to try to add
     */
    ListView.prototype.showMore = function (numToShow) {
        this._showMoreBuffer.addToGoal(numToShow);
    }


    /**
     * Remove a piece of Content from this ListView
     * @param content {Content|ContentView} The ContentView or Content to be removed
     * @returns {boolean} true if Content was removed, else false
     */
    ListView.prototype.remove = function (content) {
        var contentView = content instanceof ContentView ? content : this.getContentView(content);
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


    var showMoreBufferLog = debug('ShowMoreBuffer');

    function ShowMoreBuffer (opts) {
        opts = opts || {};
        this._goal = opts.goal;
        Transform.call(this, opts);
    }

    inherits(ShowMoreBuffer, Transform);


    ShowMoreBuffer.prototype._transform = function (chunk, requestMore) {
        showMoreBufferLog('_transform');
        if ( ! this._goal) {
            this._requestMoreWrites = requestMore;
            return;
        }
        this._goal--;
        this.push(chunk);
        requestMore(null, chunk);
    };


    ShowMoreBuffer.prototype.setGoal = function (newGoal) {
        var requestMore = this._requestMoreWrites;

        this._goal = newGoal;
        if (typeof requestMore === 'function') {
            this._requestMoreWrites = null;
            requestMore();
        }
    };


    ShowMoreBuffer.prototype.addToGoal = function (goalIncrement) {
        return this.setGoal(this._goal + goalIncrement);
    };


    ListView.ShowMoreBuffer = ShowMoreBuffer;
    return ListView;
});
