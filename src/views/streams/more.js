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
        Transform.call(this, opts);
    };

    inherits(More, Transform);


    /**
     * @private
     * Required by Transform subclasses.
     * This ensures that once the goal is reached, no more content
     * passes through.
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


    return More;
});