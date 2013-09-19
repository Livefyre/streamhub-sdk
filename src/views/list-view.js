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

        View.call(this, opts);
        Writable.call(this, opts);

        this.contentViews = [];

        this.modal = opts.modal === undefined ? new AttachmentGalleryModal() : opts.modal;
        this.contentViewFactory = new ContentViewFactory();

        this._moreAmount = opts.showMore || 50;
        this.more = opts.more || this._createMoreStream(opts);
        this.showMoreButton = opts.showMoreButton || this._createShowMoreButton(opts);
        this.showMoreButton.setMoreStream(this.more);
        this.more.pipe(this, { end: false });

        this.render();
    };

    inherits(ListView, View);
    inherits.parasitically(ListView, Writable);


    ListView.prototype.template = ListViewTemplate;

    /**
     * Class property to add to ListView instances' .el
     */
    ListView.prototype.elClass = 'streamhub-list-view';

    /**
     * Selector of .el child that contentViews should be inserted into
     */
    ListView.prototype.listElSelector = '.content-list';
    /**
     * Selector of .el child in which to render a show more button
     */
    ListView.prototype.showMoreElSelector = '.content-list-more';


    /**
     * Set the element that this ListView renders in
     * @param element {HTMLElement} The element to render the ListView in
     */
    ListView.prototype.setElement = function (element) {
        var self = this;
        View.prototype.setElement.apply(this, arguments);

        $(this.el).addClass(this.elClass);

        // .showMoreButton will trigger showMore.hub when it is clicked
        this.$el.on('showMore.hub', function () {
            self.showMore();
        });

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
     * @param content {Content} Content to display in the ListView
     * @param requestMore {function} A function to call when done writing, so
     *     that _write will be called again with more data
     */
    ListView.prototype._write = function (content, requestMore) {
        this.add(content);
        requestMore();
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

        log("add", content);

        if (contentView) {
            return contentView;
        }

        contentView = this.createContentView(content);
        if ( ! contentView) {
            return;
        }

        contentView.render();

        // Push and sort. #TODO Insert in sorted order
        if (this.contentViews.indexOf(contentView) === -1) {
            this.contentViews.push(contentView);
        }

        this.contentViews.sort(this.comparator);

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
        if (typeof numToShow === 'undefined') {
            numToShow = this._moreAmount;
        }
        this.more.setGoal(numToShow);
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

        // Remove from DOM
        this._extract(contentView);

        // Remove from this.contentViews[]
        this.contentViews.splice(this.contentViews.indexOf(contentView), 1);
        return true;
    };


    /**
     * @private
     * Remove a contentView from the DOM. Called by .remove();
     * @param contentView {ContentView} The ContentView to remove from the DOM
     */
    ListView.prototype._extract = function (contentView) {
        contentView.$el.remove();
    };


    /**
     * Insert a contentView into the ListView's .el
     * Get insertion index based on this.comparator
     * @private
     */
    ListView.prototype._insert = function (contentView) {
        var newContentViewIndex,
            $previousEl;

        newContentViewIndex = this.contentViews.indexOf(contentView);

        if (newContentViewIndex === 0) {
            // Beginning!
            contentView.$el.prependTo(this.$listEl);
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
    ListView.prototype.createContentView = function (content) {
        return this.contentViewFactory.createContentView(content);
    };


    return ListView;
});
