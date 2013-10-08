define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/view',
    'streamhub-sdk/content/content-view-factory',
    'streamhub-sdk/modal/views/attachment-gallery-modal',
    'inherits',
    'streamhub-sdk/debug',
    'stream/writable',
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/views/streams/more',
    'streamhub-sdk/views/show-more-button',
    'hgn!streamhub-sdk/views/templates/list-view'],
function($, View, ContentViewFactory, AttachmentGalleryModal, inherits,
debug, Writable, ContentView, More, ShowMoreButton, ListViewTemplate) {
    'use strict';

    var log = debug('streamhub-sdk/views/list-view');

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

        this.views = [];

        View.call(this, opts);
        Writable.call(this, opts);

        this._moreAmount = opts.showMore || 50;
        this.more = opts.more || this._createMoreStream(opts);
        this.showMoreButton = opts.showMoreButton || this._createShowMoreButton(opts);
        this.showMoreButton.setMoreStream(this.more);

        this.render();

        this._pipeMore();
    };

    inherits(ListView, View);
    inherits.parasitically(ListView, Writable);


    ListView.prototype.template = ListViewTemplate;


    /**
     * Selector of .el child that contentViews should be inserted into
     */
    ListView.prototype.listElSelector = '.hub-list';


    /**
     * Selector of .el child in which to render a show more button
     */
    ListView.prototype.showMoreElSelector = '.hub-list-more';


    ListView.prototype.setElement = function (element) {
        var self = this;
        View.prototype.setElement.apply(this, arguments);
        this.$listEl = this.$el;
        // .showMoreButton will trigger showMore.hub when it is clicked
        this.$el.on('showMore.hub', function () {
            self.showMore();
        });
    };


    /**
     * Render the ListView in its .el, and call .setElement on any subviews
     */
    ListView.prototype.render = function () {
        View.prototype.render.call(this);
        this.$listEl = this.$el.find(this.listElSelector);

        this.showMoreButton.setElement(this.$el.find(this.showMoreElSelector));
        this.showMoreButton.render();
    };


    /**
     * @private
     * Called automatically by the Writable base class when .write() is called
     * @param view {View} View to display in the ListView
     * @param requestMore {function} A function to call when done writing, so
     *     that _write will be called again with more data
     */
    ListView.prototype._write = function (view, requestMore) {
        this.add(view);
        requestMore();
    };


    /**
     * @private
     * Comparator function to determine ordering of Views.
     * Your subclass should implement this if you want ordering
     * @param a {view}
     * @param b {view}
     * @returns {Number} < 0 if a before b, 0 if same ordering, > 0 if b before a
     */
    ListView.prototype.comparator = null;


    /**
     * Add a view to the ListView
     *     insert the newView into this.el according to this.comparator
     * @param newView {View} A View to add to the ListView
     * @returns the newly added View
     */
    ListView.prototype.add = function(newView) {
        log("add", newView);

        if ( ! newView) {
            log("Called add with a falsy parameter, returning");
            return;
        }

        // Push and sort. #TODO Insert in sorted order
        if (this.views.indexOf(newView) === -1) {
            this.views.push(newView);
        }

        if (this.comparator) {
            this.views.sort(this.comparator);
        }

        // Add to DOM
        this._insert(newView);

        return newView;
    };


    /**
     * Remove a View from this ListView
     * @param content {Content|ContentView} The ContentView or Content to be removed
     * @returns {boolean} true if Content was removed, else false
     */
    ListView.prototype.remove = function (view) {
        var viewIndex = this.views.indexOf(view);

        // Return false if the provided view is not managed by this ListView
        if (viewIndex === -1) {
            return false;
        }

        // Remove from DOM
        this._extract(view);

        // Remove from this.views[]
        this.views.splice(viewIndex, 1);

        return true;
    };


    /**
     * @private
     * Remove a view from the DOM. Called by .remove();
     * @param view {View} The View to remove from the DOM
     */
    ListView.prototype._extract = function (view) {
        view.$el.remove();
    };


    /**
     * @private
     * Insert a contentView into the ListView's .el
     * Get insertion index based on this.comparator
     * @param view {View} The view to add to this.el
     */
    ListView.prototype._insert = function (view) {
        var newContentViewIndex,
            $previousEl;

        newContentViewIndex = this.views.indexOf(view);

        if (newContentViewIndex === 0) {
            // Beginning!
            view.$el.prependTo(this.$listEl);
        } else {
            // Find it's previous view and insert new view after
            $previousEl = this.views[newContentViewIndex - 1].$el;
            view.$el.insertAfter($previousEl);
        }
    };


    /**
     * Show More content.
     * ContentListView keeps track of an internal ._newContentGoal
     *     which is how many more items he wishes he had.
     *     This increases that goal and marks the Writable
     *     side of ContentListView as ready for more writes.
     * @param numToShow {number} The number of items to try to add
     */
    ListView.prototype.showMore = function (numToShow) {
        if (typeof numToShow === 'undefined') {
            numToShow = this._moreAmount;
        }
        this.more.setGoal(numToShow);
    };


    /**
     * @private
     * Create a Stream that extra content can be written into.
     * This will be used if an opts.moreBuffer is not provided on construction.
     * By default, this creates a streamhub-sdk/views/streams/more
     */
    ListView.prototype._createMoreStream = function (opts) {
        opts = opts || {};
        return new More({
            highWaterMark: 0,
            goal: opts.initial || 50
        });
    };


    /**
     * @private
     * Create a ShowMoreButton view to be used if one is not passed as
     *     opts.showMoreButton on construction
     * @return {ShowMoreButton}
     */
    ListView.prototype._createShowMoreButton = function (opts) {
        return new ShowMoreButton();
    };


    /**
     * @private
     * Register listeners to the .more stream so that the items
     * it reads out go somewhere useful.
     * By default, this .add()s the items
     */
    ListView.prototype._pipeMore = function () {
        var self = this;
        this.more.on('readable', function () {
            var content;
            while (content = self.more.read()) {
                self.add(content);
            }
        });
    };


    return ListView;
});
