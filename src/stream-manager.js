define(['streamhub-sdk/jquery', 'streamhub-sdk/event-emitter', 'streamhub-sdk/util'], function ($, EventEmitter, util) {

    /**
     * Manages a collection of Streams
     * @param streamObj {?Object<string, Stream>} A set of streams, keyed by name to add to this
     *        manager.
     * @exports streamhub-sdk/stream-manager
     * @constructor
     */
    var StreamManager = function(streamObj) {
        EventEmitter.call(this);
        streamObj = streamObj || {};
        this._streams = {};
        this._views = [];
        this.isStarted = false;
        var self = this;
        this.on('readable', function(stream) {
            // Don't read off the buffer if StreamManager isn't going to put it anywhere
            if (self._views.length === 0) {
                return;
            }

            var content = stream.read(),
                view;
            for (var i=0; i < self._views.length; i++) {
                view = self._views[i];
                if (typeof view.add === 'function') {
                    view.add(content, stream);
                }
            }
        });
        this.set(streamObj);
    };
    util.inherits(StreamManager, EventEmitter);

    /**
     * A set of pluggable stream creator methods.
     */
    StreamManager.create = {};

    /**
     * Adds a helper method to the "create" property of the StreamManager
     * @param helperFn {Function} A function that will add creators to the "create" property 
     */
    StreamManager.addHelper = function(helperFn) {
        helperFn(StreamManager.create);
    };

    /**
     * Add a Stream to the StreamManager object. Can call as `.set(name, stream)` or
     * `.set({ name1: stream1, name2: stream2 })`.
     * @param nameOrStreamObj {Object<string, Stream> | string} Either a set of streams
     *         keyed by name - with no argument 2, or the name of the stream in argument 2.
     * @param stream {?Stream} Optionally the stream as named by argument 1.
     */
    StreamManager.prototype.set = function (nameOrStreamObj, stream) {
        var self = this;

        // If passed an object, call recursively with each key/val
        if (typeof nameOrStreamObj === 'object') {
            var streamObject = nameOrStreamObj;
            for (var key in streamObject) {
                if (streamObject.hasOwnProperty(key)) {
                    self.set(key, streamObject[key]);
                }
            }
            return;
        }

        if (!stream) {
            return;
        }

        var name = nameOrStreamObj;
        self._streams[name] = stream;
        stream.on('readable', function () {
            self.emit('readable', stream);
        });
        if (self.isStarted) {
            stream.start();
        }
        self.emit('add', name, stream);
    };

    /**
     * Get all the streams inside this StreamManager object
     * @param name {?String} Get only a stream with this name.
     * @returns {Stream} The stream requested by name, or the whole set, or null.
     */
    StreamManager.prototype.get = function (name) {
        if (name) {
            return this._streams[name];
        }
        return this._streams;
    };

    /**
     * Binds a view to this stream, whose .add will be called every time data is received.
     * @params view {View} The view to bind.
     * @returns {StreamManager} "this", useful for chaining.
     */
    StreamManager.prototype.bind = function(view) {
       this._views.push(view);
       return this;
    };

    /**
     * Iterate over the StreamManager in the StreamManager object
     * @param callback {Function} A callback that will be called for each Stream with
     *        `(stream, streamName)`
     */
    StreamManager.prototype.forEach = function(callback) {
        for (var key in this._streams) {
            callback.apply(this, [this._streams[key], key]);
        }
    };

    /**
     * Calls start on all streams that are currently managed by this stream-manager.
     * Any streams added to this manager post calling start will not be started automatically.
     * @returns {StreamManager} returns 'this' for chaining.
     */
    StreamManager.prototype.start = function () {
        this.forEach(function (stream, name) {
            stream.start();
        });
        this.isStarted = true;
        return this;
    };

    return StreamManager;
});
