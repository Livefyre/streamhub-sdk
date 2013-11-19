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

        switch (opts.modal) {
            case true:
            case undefined:
                this.modal = new AttachmentGalleryModal();
                break;
            default:
                this.modal = opts.modal;
        }

        this._maxVisibleItems = opts.maxVisibleItems || 20;
        this._hasVisibleVacancy = true;
        this._endPageIndex = 0;
        this._bound = true;

        this.contentViewFactory = opts.contentViewFactory || new ContentViewFactory();

        ListView.call(this, opts);
    };

    inherits(ContentListView, ListView);

    ContentListView.prototype.insertingClassName = 'hub-wall-is-inserting';
    ContentListView.prototype.contentContainerClassName = 'hub-content-container';

    /**
     * Class property to add to ListView instances' .el
     */
    ContentListView.prototype.elClass += ' streamhub-content-list-view';

    ContentListView.prototype.bounded = function (bounded) {
        this._bound = bounded;
    };

    /**
     * Set the element that this ContentListView renders in
     * @param element {HTMLElement} The element to render the ContentListView in
     */
    ContentListView.prototype.setElement = function (element) {
        ListView.prototype.setElement.apply(this, arguments);

        this.$el.on('removeContentView.hub', function(e, data) {
            this.remove(data.contentView.content);
        }.bind(this));
        this.$el.on('focusContent.hub', function(e, context) {
            var contentView = this.getContentView(context.content);
            if (! this.modal) {
                if (contentView &&
                    contentView.attachmentsView &&
                    typeof contentView.attachmentsView.focus === 'function') {
                    contentView.attachmentsView.focus(context.attachmentToFocus);
                }
                return;
            }
            this.modal.show(context.content, { attachment: context.attachmentToFocus });
        }.bind(this));
    };


    /**
     * Comparator function to determine ordering of ContentViews.
     * ContentView elements indexes in this.el will be ordered by this
     * By default, order on contentView.content.createdAt or contentView.createdAt
     *     in descending order (new first)
     * @private
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

        this._endPageIndex++;
        if (! this.hasVisibleVacancy() && this._bound) {
            var viewToRemove = this.views[this.views.length-1];

            // Unshift content to more stream
            this.more.stash(viewToRemove.content);

            // Remove non visible view
            this.remove(viewToRemove);
        }

        return ListView.prototype.add.call(this, contentView);
    };

    ContentListView.prototype._insert = function (contentView, opts) { 
        opts = opts || {};
        var newContentViewIndex,
            $previousEl,
            $wrappedEl;

        newContentViewIndex = this.views.indexOf(contentView);

        var $containerEl = $('<div class="'+this.contentContainerClassName+' '+this.insertingClassName+'"></div>');
        contentView.$el.wrap($containerEl);
        $wrappedEl = contentView.$el.parent();

        if (newContentViewIndex === 0) {
            // Beginning!
            $wrappedEl.prependTo(this.el);
        } else {
            // Find it's previous view and insert new view after
            $previousEl = this.views[newContentViewIndex - 1].$el;
            $wrappedEl.insertAfter($previousEl.parent('.'+this.contentContainerClassName));
        }

        setTimeout(function () { $wrappedEl.removeClass(this.insertingClassName); }.bind(this), 1);

    };

    ContentListView.prototype.hasVisibleVacancy = function () {
        if (this._endPageIndex > this._maxVisibleItems) {
            this._hasVisibleVacancy = false;
        }
        return this._hasVisibleVacancy;
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

    ContentListView.prototype.showMore = function (numToShow) {
        this._bound = false;
        ListView.prototype.showMore.call(this, numToShow);
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

    ContentListView.prototype.destroy = function () {
        ListView.prototype.destroy.call(this);
        this.contentViewFactory = null;
    };

    return ContentListView;
});
