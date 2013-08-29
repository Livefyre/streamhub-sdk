define([
    'streamhub-sdk/jquery',
    'jasmine',
    'streamhub-sdk/view',
    'streamhub-sdk/stream',
    'jasmine-jquery',
    'streamhub-sdk-tests/mocks/jasmine-spy-stream'],
function ($, jasmine, View, Stream, jasminejquery, JasmineSpyStream) {
    describe('A base View', function () {
        var view, opts;

        describe('when constructed', function () {
            beforeEach(function() {
                opts = {
                    streams: {
                        main: new Stream(),
                        reverse: new Stream()
                    }
                };
                opts.streams.main.start = jasmine.createSpy();
                opts.streams.reverse.start = jasmine.createSpy();

                view = new View(opts);
            });
        });
    }); 
});
