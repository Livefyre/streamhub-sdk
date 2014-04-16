define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/views/list-view',
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/content/content-view-factory',
    'streamhub-sdk/content/views/gallery-attachment-list-view',
    'streamhub-sdk/modal/views/attachment-gallery-modal',
    'stream/writable',
    'streamhub-sdk/views/streams/more',
    'streamhub-sdk/views/show-more-button',
    'inherits',
    'streamhub-sdk/debug'],
function($, ListView, ContentView, ContentViewFactory, GalleryAttachmentListView,
        AttachmentGalleryModal, Writable, More, ShowMoreButton, inherits, debug) {
    'use strict';

    var log = debug('streamhub-sdk/content/views/content-list-view');

    /**
     * A simple View that displays Content in a list (`<ul>` by default).
     *
     * @param [opts] {Object} A set of options to config the view with
     * @param [opts.el] {HTMLElement} The element in which to render the streamed content
     * @param [opts.modal] {Boolean} Whether a modal is displayed when interacting 
     *                               with photo/video thumbnail
     * @param [opts.animate] {Boolean} Whether to add animations when content is
     *                               rendered in the ContentListView
     * @param [opts.sharer] {Sharer} 
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

        ListView.call(this, opts);

        this._stash = opts.stash || this.more;
        this._maxVisibleItems = opts.maxVisibleItems || 50;
        this._bound = true;
        this._animate = opts.animate === undefined ? true : opts.animate;
        this._liker = opts.liker;
        this._sharer = opts.sharer;
        this.contentViewFactory = opts.contentViewFactory || new ContentViewFactory();
    };

    inherits(ContentListView, ListView);

    ContentListView.prototype.insertingClassName = 'hub-wall-is-inserting';
    ContentListView.prototype.hiddenClassName = 'hub-content-container-hidden';
    ContentListView.prototype.contentContainerClassName = 'hub-content-container';

    /**
     * Class property to add to ListView instances' .el
     */
    ContentListView.prototype.elClass += ' streamhub-content-list-view';

    ContentListView.prototype.events = ListView.prototype.events.extended({
        'removeContentView.hub': function(e, data) {
            return ListView.prototype.remove.call(this, data.contentView);
        },
        'focusContent.hub': function(e, context) {
            var contentView = this.getContentView(context.content);
            if (! this.modal) {
                if (contentView &&
                    contentView.attachmentsView &&
                    typeof contentView.attachmentsView.focus === 'function') {
                    contentView.attachmentsView.focus(context.attachmentToFocus);
                }
            } else {
                var modalSubView = new GalleryAttachmentListView(context);
                this.modal.show(modalSubView);
            }
        }
    });

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

    ContentListView.prototype.bounded = function (bound) {
        this._bound = bound;
    };

    /**
     * Add a piece of Content to the ContentListView
     *     .createContentView(content)
     *     add newContentView to this.contentViews[]
     *     render the newContentView
     *     insert the newContentView into this.el according to this.comparator
     * @param content {Content} A Content model to add to the ContentListView
     * @param [forcedIndex] {number} location for the new view
     * @returns the newly created ContentView
     */
    ContentListView.prototype.add = function(content, forcedIndex) {
        log("add", content);
        if (!content.el && this.getContentView(content)) {
        //No double-adds
            log('already added', content);
            return;
        }

        //duck type for ContentView
        var contentView = content.el ? content : this.createContentView(content);

        if (this._bound && ! this._hasVisibleVacancy()) {
            var viewToRemove = this.views[this.views.length-1];
            
            // Ensure .more won't let more through right away,
            // we already have more than we want.
            this.more.setGoal(0);
            // Unshift content to more stream
            this.saveForLater(viewToRemove.content);
            
            // Remove non visible view
            this.remove(viewToRemove);
        }
        
        return ListView.prototype.add.call(this, contentView, forcedIndex);
    };

    ContentListView.prototype._insert = function (contentView, forcedIndex) {
        var newContentViewIndex,
            $previousEl,
            $wrappedEl;

        newContentViewIndex = forcedIndex || this.views.indexOf(contentView);

        if (! contentView.$el.parent('.'+this.contentContainerClassName).length) {
            var $containerEl = $('<div class="'+this.contentContainerClassName+'"></div>');
            if (this._animate) {
                $containerEl.addClass(this.insertingClassName);
            }
            contentView.$el.wrap($containerEl);
        }
        $wrappedEl = contentView.$el.parent();

        if (newContentViewIndex === 0) {
            // Beginning!
            $wrappedEl.prependTo(this.$listEl);
            $wrappedEl.css('margin-top', (-1*$wrappedEl.height())+'px');

            // Wait for the element to be rendered, before removing class which 
            // transitions the margin-top from -100% to 0
            setTimeout($.proxy(function () {
                $wrappedEl.removeClass(this.insertingClassName).css('margin-top', '');
            }, this), 0.1);
        } else {
            // Find it's previous view and insert new view after
            $previousEl = this.views[newContentViewIndex - 1].$el;
            $wrappedEl.removeClass(this.insertingClassName)
            if (this._animate) {
                $wrappedEl.addClass(this.hiddenClassName);
            }
            $wrappedEl.insertAfter($previousEl.parent('.'+this.contentContainerClassName));

            // Wait for the element to be rendered, before remvoing class which
            // transitions the opacity from 0 to 1
            setTimeout($.proxy(function () {
                $wrappedEl.removeClass(this.hiddenClassName);
            }, this), 0.1);
        }
    };

    /**
     * Remove a view from the DOM. Called by .remove();
     * @private
     * @param view {View} The View to remove from the DOM
     */
    ContentListView.prototype._extract = function (view) {
        view.$el.parent().remove();
    };

    /**
     * Checks if it is still possible to add a content item
     * into the visible list
     * @returns {Boolean} Whether a content item can be displayed
     */
    ContentListView.prototype._hasVisibleVacancy = function () {
        if (this.views.length > this._maxVisibleItems) {
            return false;
        }
        return true;
    };

    /**
     * Save formerly visible content to be redisplayed later
     * @param content {Content} A content item to be redisplayed later
     */
    ContentListView.prototype.saveForLater = function (content) {
        this._stash.stack(content);
    };

    /**
     * Remove a piece of Content from this ContentListView
     * @param content {Content|ContentView} The ContentView or Content to be removed
     * @returns {boolean} true if Content was removed, else false
     */
    ContentListView.prototype.remove = function (content) {
        var contentView = content.el ? content : this.getContentView(content); //duck type for ContentView
        contentView.remove();
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
        var view = this.contentViewFactory.createContentView(content, {
            liker: this._liker,
            sharer: this._sharer
        });
        return view;
    };

    ContentListView.prototype.destroy = function () {
        ListView.prototype.destroy.call(this);
        this.contentViewFactory = null;
    };

    return ContentListView;
});
