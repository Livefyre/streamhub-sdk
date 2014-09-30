var $ = require('streamhub-sdk/jquery');
var inherits = require('inherits');
var ListView = require('streamhub-sdk/views/list-view');
var ContentView = require('streamhub-sdk/content/views/content-view');
var ContentViewFactory = require('streamhub-sdk/content/content-view-factory');
var hasAttachmentModal = require('streamhub-sdk/content/views/mixins/attachment-modal-mixin');
var hasQueue = require('streamhub-sdk/views/mixins/queue-mixin');
var debug = require('streamhub-sdk/debug');

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
 * @param [opts.streamOnly] {Boolean} Toggles if visible views are stored and ifthe Show More 
 *                                      button is rendered
 * @exports streamhub-sdk/views/list-view
 * @constructor
 */
var ContentListView = function (opts) {
    opts = opts || {};
    this.modal = hasAttachmentModal(this, opts.modal);

    var listOpts = $.extend({}, opts);
    listOpts.autoRender = false;
    ListView.call(this, listOpts);
    hasQueue(this, opts);

    opts.autoRender = opts.autoRender === undefined ? true : opts.autoRender;
    if (opts.autoRender) {
        this.render();
    }

    if (opts.streamOnly) {
        this._stash = { stack : function() {} };
        var btn = this.$el.find(this.showMoreElSelector)
        if (btn.length) {
            btn.remove();
        }
    } else {
        this._stash = opts.stash || this.more;
    }

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
        return this.remove(data.contentView);
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
ContentListView.prototype.comparator = ListView.prototype.comparators.CREATEDAT_DESCENDING;

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
 * @param [opts] {Object} A set of options to config the view with
 * @param [opts.tail] {Boolean} Whether items are added to the tail or head
 * @returns the newly created ContentView
 */
ContentListView.prototype.add = function(content, forcedIndex, opts) {
    log("add", content);
    opts = opts || {};
    if (!content.el && this.getContentView(content)) {
    //No double-adds
        log('already added', content);
        return;
    }

    //duck type for ContentView
    var contentView = content.el ? content : this.createContentView(content);

    var newView = ListView.prototype.add.call(this, contentView, forcedIndex);

    if (this._bound && !this._hasVisibleVacancy()) {
        if (opts.tail) {
            var viewToRemove = this.views[0];
        } else {
            var viewToRemove = this.views[this.views.length-1];
        }
        
        // Ensure .more won't let more through right away,
        // we already have more than we want.
        this.more.setGoal(0);
        // Unshift content to more stream
        this.saveForLater(viewToRemove.content);
        
        // Remove non visible view
        this.remove(viewToRemove);
    }
    
    return newView;
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
    ListView.prototype.remove.call(this, contentView);
};

ContentListView.prototype.showMore = function (numToShow) {
    this._bound = false;
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
    this._liker = null;
    this._sharer = null;
};

module.exports = ContentListView;
