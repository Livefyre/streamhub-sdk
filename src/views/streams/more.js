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
     * @constructor
     * @param opts {object}
     * @param [opts.goal=0] {number} The initial amount to let through
     */
    var More = function (opts) {
        opts = opts || {};
        this._goal = opts.goal || 0;
        this._stash = [];
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


    More.prototype._read = function () {
        var stash = this._stash;
        if (stash.length) {
            return this.push(stash.shift());
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
     * Stash Content that should be re-emitted later in last-in-first-out
     * fashion. Stashed stuff is read out before written stuff
     * @param obj {Object} An object to stash, that you may want back later
     */
    More.prototype.stash = function (obj) {
        var buffer = this._readableState.buffer;
        buffer.unshift(obj);
    };

    return More;
});