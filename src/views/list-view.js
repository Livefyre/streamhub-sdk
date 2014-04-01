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

    // HTML attribute applied to ListView#el when there is more data to be shown
    // and the show more button is visible.
    var HAS_MORE_DATA_ATTR = 'data-hub-has-more';

    /**
     * A simple View that displays Content in a list (`<ul>` by default).
     *
     * @param [opts] {Object} A set of options to config the view with
     * @param [opts.el] {HTMLElement} The element in which to render the streamed content
     * @param [opts.comparator] {function(view, view): number}
     * @param [opts.autoRender] Whether to call #render in the constructor
     * @exports streamhub-sdk/views/list-view
     * @constructor
     */
    var ListView = function(opts) {
        opts = opts || {};
        opts.autoRender = opts.autoRender === undefined ? true : opts.autoRender;

        this.views = [];

        View.call(this, opts);
        Writable.call(this, opts);

        this.comparator = opts.comparator || this.comparator;
        this._moreAmount = opts.showMore || 50;
        this._setMoreStream(opts.more || this._createMoreStream(opts));
        this.showMoreButton = opts.showMoreButton || this._createShowMoreButton(opts);
        this.showMoreButton.setMoreStream(this.more);

        //TODO(ryanc): This is out of convention to call #render
        // in the constructor. However it is convenient/intuitive
        // in the public API to instantiate a ListView and have it be visible.
        // Removing this to require an explicit invocation would alter
        // the public API siginificantly, so for now render stays in the
        // constructor. To avoid this behavior, opts.autoRender == false.
        if (opts.autoRender) {
            this.render();
        }

        this._pipeMore();
    };

    inherits(ListView, View);
    inherits.parasitically(ListView, Writable);


    ListView.prototype.events = View.prototype.events.extended({
        // .showMoreButton will trigger showMore.hub when it is clicked
        'showMore.hub': function (e) {
            this.showMore();
            this.$el.removeAttr(HAS_MORE_DATA_ATTR);
            e.stopPropagation();
        },
        // When a subview .remove()s itself, it should fire this event
        'removeView.hub': function (event, view) {
            this.remove(view);
        }
    });

    ListView.prototype.template = ListViewTemplate;


    /**
     * Selector of .el child that contentViews should be inserted into
     */
    ListView.prototype.listElSelector = '.hub-list';


    /**
     * Selector of .el child in which to render a show more button
     */
    ListView.prototype.showMoreElSelector = '.hub-list-more';
    
    
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

        this.showMoreButton.setElement(this.$el.find(this.showMoreElSelector));
        this.showMoreButton.render();
        if (this.showMoreButton.isHolding()) {
            this.showMoreButton.$el.show();
        }
    };

    /**
     * Set the More stream for this listView
     */
    ListView.prototype._setMoreStream = function (moreStream) {
        if (this.more) {
            // Remove listener on old more
            this.more.removeListener('hold', this._onHeldMore);
        }
        this.more = moreStream;
        this.more.on('hold', this._onHeldMore.bind(this));
        return this.more;
    };

    /**
     * Called when we find out there is more data behind the show more button
     */
    ListView.prototype._onHeldMore = function () {
        if (this.$el) {
            this.$el.attr(HAS_MORE_DATA_ATTR, true);
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
     * Create a Stream that extra content can be written into.
     * This will be used if an opts.moreBuffer is not provided on construction.
     * By default, this creates a streamhub-sdk/views/streams/more
     * @private
     */
    ListView.prototype._createMoreStream = function (opts) {
        opts = opts || {};
        return new More({
            highWaterMark: 0,
            goal: opts.initial || 50
        });
    };


    /**
     * Create a ShowMoreButton view to be used if one is not passed as
     *     opts.showMoreButton on construction
     * @private
     * @return {ShowMoreButton}
     */
    ListView.prototype._createShowMoreButton = function (opts) {
        return new ShowMoreButton();
    };


    /**
     * Register listeners to the .more stream so that the items
     * it reads out go somewhere useful.
     * By default, this .add()s the items
     * @private
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

    return ListView;
});
