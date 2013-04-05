define(['jquery', 'streamhub-sdk/event-emitter', 'streamhub-sdk/streams', 'streamhub-sdk/util'], function($, EventEmitter, Streams, util) {

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

        var streams = opts.streams;
        if ( ! Boolean(streams instanceof Streams)) {
            streams = new Streams(streams);
        }
        this.streams = streams;

        this.el = opts.el;
        this.contentSet = [];

        var self = this;

        streams.on('readable', function (stream) {
            var content = stream.read();
            self.contentSet.push(content);
            self.emit('add', content, self);
        });

        this.initialize.apply(this, arguments);
    };
    $.extend(View.prototype, EventEmitter.prototype);

    /**
     * Create an extended subclass of View
     * @param prototypeExtension {Object} Properties to add to the subclass's prototype
     */
    View.extend = util.extend;

    /**
     * Initializes the View after construction. Subclasses can implement this
     */
    View.prototype.initialize = function () {};

    /**
     * Triggers the view's streams to start.
     * @param streamNames {[Array.<string>|string]?} A list of (or singular) stream names to call
     *     .start() on (Defaults to ["main"]). Also accepts "*" for all streams. 
     */
    View.prototype.startStreams = function(streamNames) {
        this.streams.start(streamNames);
    };

    /**
     * Triggers the view's reverse stream to start, if present.
     */
    View.prototype.streamOlder = function() {
        this.startStreams("reverse");
    };

    return View;
});