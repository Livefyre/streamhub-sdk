define([
    'inherits',
    'stream/transform',
    'streamhub-sdk/debug',
    'stream/util'],
function (inherits, Transform, debug, streamUtil) {
    'use strict';


    var log = debug('streamhub-sdk/views/streams/more');


    /**
     * A Duplex stream (Readable & Writable) that only passes through
     * the number of items it is instructed to.
     * More also maintains a LIFO stack such that previously emitted Content can
     * be stashed back into More so that it is re-read out later when needed.
     * @constructor
     * @param opts {object}
     * @param [opts.goal=0] {number} The initial amount to let through
     */
    var More = function (opts) {
        opts = opts || {};
        this._goal = opts.goal || 0;
        this._stack = [];
        this._requestMore = null;
        Transform.call(this, opts);
    };

    inherits(More, Transform);


    /**
     * Required by Transform subclasses.
     * This ensures that once the goal is reached, no more content
     * passes through.
     * @private
     */
    More.prototype._transform = function (chunk, requestMore) {
        console.log("More._transform", this);
        var self = this;
        log('_transform', chunk);

        this._stack.unshift(chunk);
        if (chunk >= 5) {
            debugger;
        }
        if (this._goal <= 0) {
            this._requestMore = requestMore;
            this.emit('hold');
            return;
        }

        this._pushAndContinue();
        requestMore();
    };


    More.prototype._read = function () {
        if (this._stack.length) {
            if (this._goal >= 0) {
                this._pushAndContinue();
                return;
            }
        }

        return Transform.prototype._read.apply(this, arguments);
    }

    More.prototype._pushAndContinue = function () {
        console.log("More._pushAndContinue", this)
        this._goal--;
        this.push(this._stack.pop());
        if ( ! this._stack.length &&
            typeof this._requestMore === 'function') {
            this._requestMore();
            this._requestMore = null;
        }
    }

    /**
     * Let more items pass through.
     * This sets the goal of the stream to the provided number.
     * @param newGoal {number} The number of items this stream should
     *     let through before holding again.
     */
    More.prototype.setGoal = function (newGoal) {
        this._goal = newGoal;

        if (this._goal >= 0) {
            this._pushAndContinue();
        }
    };


    /**
     * Get the number of objects the stream is waiting for to reach its goal
     */
    More.prototype.getGoal = function () {
        return this._goal;
    };


    /**
     * stack Content that should be re-emitted later in last-in-first-out
     * fashion. stacked stuff is read out before written stuff
     * @param obj {Object} An object to stack, that you may want back later
     */
    More.prototype.stack = function (obj) {
        this._stack.push(obj);
    };

    return More;
});
