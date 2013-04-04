define(['jquery', 'streamhub-sdk/event-emitter'], function($, EventEmitter) {
    
    /**
     * Defines a base view object that listens to a set streams, adds objects to an 
     * internal collection when received from the streams, and then emits an 'add' event.
     * Subclasses are responsible for listening to the "add" events and using them to 
     * display streamed content.
     * @param opts {Object} A set of options to config the view with
     * @param opts.streams {Object.<string, Stream>} A dictionary of streams to listen to
     * @param opts.el {HTMLElement} The element in which to render the streamed content
     * @constructor
     */
    var View = function(opts) {
        EventEmitter.call(this);
        opts = opts || {};
        this.opts = opts;
        this.streams = opts.streams;
        this.el = opts.el;
        this.contentSet = [];
        
        var self = this;

        var readableCallback = function() {
            var content = this.read();
            self.contentSet.push(content);
            self.emit('add', content, this);
        };

        if ( typeof this.streams === 'object' ) {
            var keys = Object.keys(this.streams);
            for (var i in keys) {
                this.streams[keys[i]].on('readable', readableCallback);
            }
        }
    };
    $.extend(View.prototype, EventEmitter.prototype);
    
    /**
     * Triggers the view's streams to start.
     * @param streamNames {[Array.<string>|string]?} A list of (or singular) stream names to call
     *     .start() on (Defaults to ["main"]). Also accepts "*" for all streams. 
     */
    View.prototype.startStreams = function(streamNames) {
        if (!streamNames) {
            streamNames = ["main"];
        } else if (typeof streamNames == "string") {
            if (streamNames == "*") {
                streamNames = Object.keys(this.streams); 
            } else {
                streamNames = [streamNames];
            }
        }
        
        for (var i in streamNames) {
            if (this.streams[streamNames[i]]) {
                this.streams[streamNames[i]].start();
            }
        }
    };

    /**
     * Triggers the view's reverse stream to start, if present.
     */
    View.prototype.streamOlder = function() {
        this.startStreams("reverse");
    };

    return View;
});