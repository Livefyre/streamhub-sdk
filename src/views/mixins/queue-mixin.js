var ShowMoreButton = require('streamhub-sdk/views/show-more-button');
var More = require('streamhub-sdk/views/streams/more');

/**
 * Mixin to a ListView to give it 'queueing' behavior.
 * It adds a .queue writable stream that you can pipe an infinite stream
 * of views to, and they will be queued
 * When there are queued items, a queueButton will be rendered that when clicked
 * lets the queued items into the ListView
 */
var HasQueueMixin = function (listView, opts) {
    opts = opts || {};
    listView.showQueueElClass = 'hub-list-queue';
    listView.showQueueElSelector = '.'+listView.showQueueElClass;

    listView.events = listView.events.extended({
        // .showMoreButton will trigger showMore.hub when it is clicked
        'showMore.hub .hub-list-queue': function (e) {
            listView.showQueue();
        }
    });
    listView.delegateEvents();

    function createQueueStream(opts) {
        opts = opts || {};
        return new More({
            highWaterMark: 100,
            goal: opts.queueInitial === undefined ? Infinity : opts.queueInitial
        });
    };

    function createShowQueueButton(opts) {
        return new ShowMoreButton(opts);
    };

    /**
     * Register listeners to the .queue stream so that the items
     * it reads out go somewhere useful.
     * By default, this .add()s the items
     * @private
     */
    function pipeQueue() {
        listView.queue.on('readable', function () {
            var content;
            while (content = listView.queue.read()) {
                listView.add(content);
            }
        });
    };

    listView.showQueue = function (numToShow) {
        if (typeof numToShow === 'undefined') {
            listView.queue.showAll();
        }
        listView.queue.setGoal(numToShow);
    };

    var oldRender = listView.render;
    listView.render = function () {
        oldRender.call(listView);
        listView.showQueueButton.setElement(
            listView.$el.find(listView.showQueueElSelector)
        );
        listView.showQueueButton.render();
        if (listView.showQueueButton.isHolding()) {
            listView.showQueueButton.$el.show();
        }
    };

    // init
    listView.queue = opts.queue || createQueueStream(opts);
    listView.showQueueButton = opts.showQueueButton || createShowQueueButton(opts);
    listView.showQueueButton.setMoreStream(listView.queue);
    pipeQueue();
};

module.exports = HasQueueMixin;
