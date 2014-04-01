define([
    'inherits',
    'stream/writable',
    'stream/readable',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-sdk/debug'],
function (inherits, Writable, Readable, ContentListView, debug) {
    'use strict';


    var log = debug('streamhub-sdk/views/streams/injector');


    /**
     * A Writable stream that directly adds items to a ContentListView. It
     * counts the number of items added to the view and adds another piece of
     * content at the specified interval.
     * @constructor
     * @param [opts] {Object}
     * @param [opts.source] {Readable} Souce for Injector content.
     * @param [opts.target] {ContentListView} View to target content to.
     * @param [opts.count] {number} The default number of items to add.
     * @param [opts.interval] {number} The number of items that need to be
     *      added to the targeted ContentListView before this Injector adds
     *      its count of content items.
     */
    var Injector = function (opts) {
        opts = opts || {};
        this.count = opts.count || this.count;
        this._stack = [];
        this._requestMore = null;
        this._interval = opts.interval || 1;
        this._counter = -1;//Works well for archived content, resets to 0
        this._written = [];
        this._target = null;
        
        Writable.call(this, opts);
        if (opts.source) {
            opts.source.pipe(this);
        }
        if (opts.target) {
            this.target(opts.target);
        }
    };
    inherits(Injector, Writable);

    
    /**
     * The default number of content items to inject when no number is provided.
     * @type {!number} Should be greater than 0.
     */
    Injector.prototype.count = 1;
    
    /**
     * Update the interval setting. Will trigger an injection and reset the
     * counter if the new interval is less than the counter.
     * @param n {!number} >= 1
     */
    Injector.prototype.setInterval = function (n) {
        if (typeof(n) === 'number' && n >= 1) {
            this._interval = n;
            if (this._interval <= this._counter) {
                this.now();
            }
        }
    };
    
    /**
     * Returns the current value of the ._counter
     * @returns {!number}
     */
    Injector.prototype.getCounter = function () {
        return this._counter;
    };
    
    /**
     * Registers a ContentListView or subclass. Listens for added Views
     * and injects at the specified interval.
     * @param contentListView {!ContentListView}
     * @param [opts} {Object}
     */
    Injector.prototype.target = function(contentListView, opts) {
        if (this._target) {
            throw "Target already set. " +
                    "Need to .untarget() before trying to .target().";
        }
        
        this._target = contentListView;
        this._target.on('added', this._addHandler.bind(this));
        return this;
    };
    
    /**
     * Removes the current target.
     */
    Injector.prototype.untarget = function () {
        this._target && this._target.removeListener('added', this._addHandler);
        this._target = null;
        this._counter = 0;
    };
    
    /**
     * Handles the 'added' event. Takes the view and triggers injections.
     * @param [view] {View} Currently assumed to be a ContentView
     * @protected
     */
    Injector.prototype._addHandler = function (view) {
        var i = (view) ? this._written.indexOf(view.content || view) : -1;
        if (i < 0) {
        //Didn't originate from Injecor, so increment the counter
            this._counter++;
        } else {
        //Recover some memory
            this._written.splice(i, 1);
        }
        
        //Track index for injecting content
        this._index = (view) ? this._target.views.indexOf(view) || 0 : 0;
        
        if (this._counter === this._interval) {
            this.now();
        }
    };

    /**
     * Injects the preset or specified number of content items.
     * Doesn't reset the counter. Returns number of injections attempted.
     * @param [n] {number} Number of items to inject. Default is .count
     * @param [i] {number} >= 0 at which to inject content.
     *          Defaults to index of previously caught "added" or 0.
     * @returns {!number}
     */
    Injector.prototype.inject = function (n, i) {
        if (!this._target) {
            throw '_target needs to exist before calling inject()';
        }
        var count = this._count = n || this.count;
        this._index = i || this._index;
        
        if (this._count >= 0) {
            this._fetchAndPush();
        }
        return count;
    };
    
    /**
     * Injects and resets the counter. Really just a wrapper for inject() that
     * resets the counter. Returns this Injector.
     * @param [n] {number} Number of items to inject. Default is .count.
     * @param [i] {number} >= 0 at which to inject content.
     *          Defaults to index of previously caught "added" or 0.
     * @returns {!Injector}
     */
    Injector.prototype.now = function (n, i) {
        this._counter = 0;
        this.inject(n, i);
        return this;
    };


    /**
     * Required by Writable subclasses.
     * This ensures that once the inject count is reached, no more content
     * is pushed.
     * @private
     */
    Injector.prototype._write = function (chunk, doneWriting) {
        log('_write', chunk);

        // Put on BOTTOM of the stack.
        // written stuff comes after all stacked stuff
        this._stack.unshift(chunk);

        // Save the doneWriting cb for later. We'll call it once this
        // new bottom of the stack is popped, and we need more data
        // from the Writable side of the duplex
        this._requestMore = function () {
            this._requestMore = null;
            doneWriting();
        }.bind(this);

        if (this._count >= 1) {
            this._fetchAndPush();
        } else {
            // Emit 'hold' to signify that there is data waiting, if only
            // the goal were increased. This is useful to render a 'show more'
            // button only if there is data in the buffer, and avoids a
            // show more button that, when clicked, does nothing but disappear
            this.emit('hold');
        }
    };


    /**
     * Fetch data from the internal stack (sync) and add it.
     * Or, if there is nothing in the stack, request more as a Writable
     * which will eventually call this again.
     * @private
     */
    Injector.prototype._fetchAndPush = function () {
        // If there's data in the stack, pop, push it along, & decrement goal
        if (this._stack.length) {
            // There's stuff in the stack. Use it.
            this._count--;
            var content = this._stack.pop();
            this._written.push(content);
            this._target.add(content, this._index);
        }

        // If there was no data, or we just pushed the last bit,
        // request more if possible
        if (this._stack.length === 0 &&
            typeof this._requestMore === 'function') {
            this._requestMore();
        }
    };


    return Injector;
});
