define(['jquery', 'streamhub-sdk/stream', 'jasmine'], function($, Stream, jasmine) {

    /**
     * Defines a livefyre stream that is readable and writable from and to a livefyre conversation.
     * @param opts {Object} A set of options to config the stream client with
     * @constructor
     */
    var JasmineSpyStream = function(opts) {
        Stream.call(this);
        this.on = jasmine.createSpy();
        this.start = jasmine.createSpy();
    };
    JasmineSpyStream.prototype = new Stream();

    return JasmineSpyStream;
});
