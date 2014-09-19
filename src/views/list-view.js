var $ = require('streamhub-sdk/jquery');
var inherits = require('inherits');
var debug = require('streamhub-sdk/debug');
var View = require('streamhub-sdk/view');
var Writable = require('stream/writable');
var ListViewTemplate = require('hgn!streamhub-sdk/views/templates/list-view');
var hasMore = require('streamhub-sdk/views/mixins/more-mixin');

'use strict';

var log = debug('streamhub-sdk/views/list-view');

/**
 * A simple View that displays Content in a list (`<ul>` by default).
 *
 * @param [opts] {Object} A set of options to config the view with
 * @param [opts.el] {HTMLElement} The element in which to render the streamed content
 * @param [opts.comparator] {function(view, view): number}
 * @param [opts.autoRender] Whether to call #render in the constructor
 * @param [opts.template] {function<string>} A function that returns the HTML
 *   that should be initially rendered
 * @exports streamhub-sdk/views/list-view
 * @constructor
 */
var ListView = function(opts) {
    opts = opts || {};
    opts.autoRender = opts.autoRender === undefined ? true : opts.autoRender;

    if (opts.template) {
        this.template = opts.template
    }
    this.views = [];
    this._streamOnly = opts.streamOnly ? true : false;

    View.call(this, opts);
    Writable.call(this, opts);
    hasMore(this, {
        more: opts.more,
        initial: opts.initial,
        showMore: opts.showMore,
        showMoreButton: opts.showMoreButton,
        getButtonEl: function () {
            var el = this.$(this.showMoreElSelector)[0];
            if ( ! el) {
                throw new Error("Can't get show more button for ListView");
            }
            return el;
        }.bind(this)
    });

    this.comparator = opts.comparator || this.comparator;

    //TODO(ryanc): This is out of convention to call #render
    // in the constructor. However it is convenient/intuitive
    // in the public API to instantiate a ListView and have it be visible.
    // Removing this to require an explicit invocation would alter
    // the public API siginificantly, so for now render stays in the
    // constructor. To avoid this behavior, opts.autoRender == false.
    if (opts.autoRender) {
        this.render();
    }
};

inherits(ListView, View);
inherits.parasitically(ListView, Writable);


ListView.prototype.events = View.prototype.events.extended({
    // When a subview .remove()s itself, it should fire this event
    'removeView.hub': function (event, view) {
        this.remove(view);
    }
});

ListView.prototype.template = ListViewTemplate;

/**
 * Selector of .el child that contentViews should be inserted into
 * @protected
 */
ListView.prototype.listElSelector = '.hub-list';

/**
 * Selector for descendant that should be used as the show more button
 * @protected
 */
ListView.prototype.showMoreElSelector = '> .hub-list-more';

var comparators;
ListView.prototype.comparators = comparators = {
    CREATEDAT_ASCENDING: function (a, b) {
        var aDate = getContentViewDate(a);
            bDate = getContentViewDate(b);
        return aDate - bDate;
    },
    CREATEDAT_DESCENDING: function (a, b) {
        return -1 * comparators.CREATEDAT_ASCENDING(a, b);
    }
};

/**
 * Given a ContentView, get a date object to use when sorting the most common
 * way, prioritizing: .content.sortOrder, .content.createdAt, .createdAt
 */
function getContentViewDate(contentView) {
    var content = contentView.content;
    // if sortOrder on content, cast to date
    var sortOrder = content.sortOrder;
    if (typeof sortOrder === 'number') {
        return new Date(sortOrder * 1000);
    }
    // default to content.createdAt or now
    if (content && content.createdAt) {
        return content.createdAt;
    }
    // if some random view, use its createdAt or now
    return contentView.createdAt || new Date();
}

/**
 * Keys are views that were forcibly indexed into this view.
 * @type {Object.<string, boolean>}
 * @private
 */
ListView.prototype._indexedViews = {};


ListView.prototype.setElement = function (element) {
    View.prototype.setElement.apply(this, arguments);
    this.$listEl = this.$el;
};


/**
 * Render the ListView in its .el, and call .setElement on any subviews
 */
ListView.prototype.render = function () {
    View.prototype.render.call(this);
    this.$listEl = this.$el.find(this.listElSelector);

    if (!this.comparator === ListView.prototype.comparators.CREATEDAT_ASCENDING) {
        this.$el.find(this._listView.showMoreElSelector).insertBefore(this._listView.$listEl);
        this.$el.find(this._listView.showQueueElSelector).insertAfter(this._listView.$listEl);
    }
};


/**
 * Called automatically by the Writable base class when .write() is called
 * @private
 * @param view {View} View to display in the ListView
 * @param requestMore {function} A function to call when done writing, so
 *     that _write will be called again with more data
 */
ListView.prototype._write = function (view, requestMore) {
    this.add(view);
    requestMore();
};


/**
 * Comparator function to determine ordering of Views.
 * Your subclass should implement this if you want ordering
 * @param a {view}
 * @param b {view}
 * @returns {Number} < 0 if a before b, 0 if same ordering, > 0 if b before a
 */
ListView.prototype.comparator = null;


/**
 * Returns true if the view is listed on the indexedViews list.
 * @param view {!View}
 * @returns {!boolean}
 * @protected
 */
ListView.prototype._isIndexedView = function(view) {
    return (view && view.uid && this._indexedViews[view.uid]) ? true : false;
};

/**
 * Adds a view to _indexedViews
 * @param view {!View}
 * @private
 */
ListView.prototype._recordIndexedView = function(view) {
    this._indexedViews[view.uid] = true;
};

/**
 * Returns the index where newView should be inserted.
 * Requires this.comparator to be defined.
 * @private
 * @param newView {view} View that will be added.
 * @param [array] {[]} Array to search through. Defaults to this.views.
 * @return {!number}
 */
ListView.prototype._binarySearch = function(newView, array) {
    array = array || this.views;
    if (!this.comparator) {
        throw new Error("Tried to _binarySearch without this.comparator.");
    }

    var low = 0, high = array.length, mid, comp, origMid;
    while (low < high) {
        origMid = mid = (low + high) >>> 1;
        comp = array[mid];

        while (this._isIndexedView(comp) && mid > low) {
        //Try to get a comp that isn't indexed
        //Move lower looking for a comparable view
            comp = array[--mid];
        }
        if (this._isIndexedView(comp)) {
        //If nothing was found...
            if (low === 0) {
            //...and we're at the beginning, then just add it to the beginning
                high = low;
            } else {
            //...and we aren't at the beginning, continue to move towards the end
                low = origMid + 1;
            }
        } else {
        //Set new low or high and start again
            if (this.comparator(comp, newView) < 0) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
    }

    return Math.max(0, low);//Incase of miscalculations, use max() to assure minimum of 0
};


/**
 * Add a view to the ListView
 *     insert the newView into this.el according to this.comparator
 * @param newView {View} A View to add to the ListView
 * @param [forcedIndex] {number} location for the new view
 * @returns the newly added View
 */
ListView.prototype.add = function(newView, forcedIndex) {
    log("add", newView, forcedIndex);
    var index;

    if ( ! newView) {
        log("Called add with a falsy parameter, returning");
        return;
    }

    if (typeof(forcedIndex) !== 'number' || Math.abs(forcedIndex) > this.views.length) {
        if (this.comparator) {
            index = this._binarySearch(newView);
        } else {
            index = this.views.length;
        }
    } else {
        this._recordIndexedView(newView);
    }

    this.views.splice(forcedIndex || index, 0, newView);

    newView.render();
    // Add to DOM
    this._insert(newView, forcedIndex);
    this.emit('added', newView);
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


    //Clean up views that will no longer be rendered
    //if streaming
    if(this._streamOnly){
        view.destroy();
    //Or let the thing using this View clean it up
    } else {
        this.emit('removed', view);
    }

    return true;
};


/**
 * Remove a view from the DOM. Called by .remove();
 * @private
 * @param view {View} The View to remove from the DOM
 */
ListView.prototype._extract = function (view) {
    view.$el.remove();
};


/**
 * Insert a contentView into the ListView's .el
 * @protected
 * @param view {View} The view to add to this.el
 * @param [forcedIndex] {number} Index of the view in this.views
 */
ListView.prototype._insert = function (view, forcedIndex) {
    var newContentViewIndex,
        $previousEl;

    newContentViewIndex = forcedIndex || this.views.indexOf(view);

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
 * Detaches list item view elements.
 * Removes references to list item views.
 */
ListView.prototype.clear = function () {
    for (var i=0; i < this.views.length; i++) {
        this.views[i].detach();
    }
    this.views = [];
};

ListView.prototype.destroy = function () {
    View.prototype.destroy.call(this);
    this.views = null;
};

module.exports =  ListView;
