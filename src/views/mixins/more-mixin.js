var ShowMoreButton = require('streamhub-sdk/views/show-more-button');
var More = require('streamhub-sdk/views/streams/more');
var Writable = require('stream/writable');

/**
 * Mixin to a ListView to give it 'show more' behavior.
 * It adds a .more writable stream that you can pipe an infinite stream
 * of views to
 * It also adds a 'show more' button on render that, when clicked,
 * gets 50ish more items and adds them to the listview.
 */
var HasMoreMixin = function (listView, opts) {
    opts = opts || {};
    listView._moreAmount = opts.showMore || 50;
    if ( ! opts.getButtonEl) {
        throw new Error('HasMoreMixin must be passed getButtonEl function to '+
                        'know where to render the showMoreButton');
    }

    listView.events = extendEvents(listView.events, {
        // .showMoreButton will trigger showMore.hub when it is clicked
        'showMore.hub': function (e) {
            e.stopPropagation();
            listView.showMore();
        }
    });
    listView.delegateEvents();

    /**
     * Create a ShowMoreButton view to be used if one is not passed as
     *     opts.showMoreButton on construction
     * @private
     * @return {ShowMoreButton}
     */
    function createShowMoreButton(opts) {
        return new ShowMoreButton(opts);
    };

    /**
     * Create a Stream that extra content can be written into.
     * This will be used if an opts.moreBuffer is not provided on construction.
     * By default, this creates a streamhub-sdk/views/streams/more
     * @private
     */
    function createMoreStream(opts) {
        opts = opts || {};
        return new More({
            highWaterMark: 0,
            goal: opts.initial === undefined ? 50 : opts.initial
        });
    };

    /**
     * Register listeners to the .more stream so that the items
     * it reads out go somewhere useful.
     * By default, this .add()s the items
     * @private
     */
    function pipeMore() {
        var writableAdder = new Writable({
            objectMode: true,
            highWaterMark: 0,
            lowWaterMark: 0
        });
        writableAdder._write = function (chunkToAdd, done) {
            try {
                listView.add(chunkToAdd);
            } catch (err) {
                listView.emit('error.add', err);
            }
            return done();
        };

        listView.more.pipe(writableAdder);
    };

    /**
     * Show More content.
     * ContentListView keeps track of an internal ._newContentGoal
     *     which is how many more items he wishes he had.
     *     This increases that goal and marks the Writable
     *     side of ContentListView as ready for more writes.
     * @param numToShow {number} The number of items to try to add
     */
    var oldShowMore = listView.showMore;
    listView.showMore = function (numToShow) {
        if (oldShowMore) {
            oldShowMore.apply(listView, arguments);
        }

        if (typeof numToShow === 'undefined') {
            numToShow = listView._moreAmount;
        }
        listView.more.setGoal(numToShow);
    };

    var oldRender = listView.render;
    listView.render = function () {
        oldRender.call(listView);
        listView.showMoreButton.setElement(opts.getButtonEl());
        listView.showMoreButton.render();
        if (listView.showMoreButton.isHolding()) {
            listView.showMoreButton.$el.show();
        }
    };

    // init
    listView.more = opts.more || createMoreStream(opts);
    listView.showMoreButton = opts.showMoreButton || createShowMoreButton(opts);
    listView.showMoreButton.setMoreStream(listView.more);
    pipeMore();
};

module.exports = HasMoreMixin;


// add events to the listVIew, handling whether listview.events
// is a view/event-map or just a normal POJO
function extendEvents(oldEvents, newEvents) {
    // if it is an eventmap, use .extended and return
    if (typeof oldEvents.extended === 'function') {
        return oldEvents.extended(newEvents);
    }
    for (var key in newEvents) {
        if (newEvents.hasOwnProperty(key)) {
            oldEvents[key] = newEvents[key];
        }
    }
    return oldEvents;
}
