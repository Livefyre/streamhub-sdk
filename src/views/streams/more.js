define([
    'inherits',
    'stream/transform',
    'streamhub-sdk/debug'],
function (inherits, Transform, debug) {
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
        var self = this;
        log('_transform', chunk);

        if (this._goal <= 0) {
            this._pushAndContinue = pushAndContinue;
            this.emit('hold');
            return;
        }

        pushAndContinue();

        function pushAndContinue() {
            self._goal--;
            self.push(chunk);
            requestMore();
        }
    };


    /**
     * Get content to be read out.
     * Prioritizes Content in the stack over stuff that has been written in
     * This is called by the Readable/Transform internals.
     * @private
     */
    More.prototype._read = function () {
        var stack = this._stack;
        var oldPushAndContinue;
        var pushFromStack = function () {
            this._goal--;
            this.push(stack.pop());
        }.bind(this);

        if (this._goal <= 0) {
            oldPushAndContinue = this._pushAndContinue;
            this._pushAndContinue = function () {
                pushFromStack();
                this._pushAndContinue = oldPushAndContinue;
            }.bind(this);
            this.emit('hold');
            return this.push();
        }

        if (this._stack.length) {
            return pushFromStack();
        }

        return Transform.prototype._read.apply(this, arguments);
    };


    /**
     * Let more items pass through.
     * This sets the goal of the stream to the provided number.
     * @param newGoal {number} The number of items this stream should
     *     let through before holding again.
     */
    More.prototype.setGoal = function (newGoal) {
        var pushAndContinue = this._pushAndContinue;

        this._goal = newGoal;

        if (this._goal >= 0 && typeof pushAndContinue === 'function') {
            this._pushAndContinue = null;
            pushAndContinue();
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
