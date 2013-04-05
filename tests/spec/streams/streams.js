define([
    'jquery',
    'jasmine',
    'jasmine-jquery',
    '../../mocks/jasmine-spy-stream',
    'streamhub-sdk',
    'streamhub-sdk/stream',
    'streamhub-sdk/streams',
    'streamhub-sdk/streams/livefyre-collection-streams'],
function ($, jasmine, jasmineJquery, JasmineSpyStream, Hub, Stream, Streams, LivefyreCollectionStreams) {
    "use strict";

    var livefyreCollectionOpts = {
        network: 'labs-t402.fyre.co',
        siteId: 303827,
        articleId: "labs_demo_fire",
        environment: "t402.livefyre.com"
    };

    describe('Streams', function () {
        var streams,
            origStreams;

        beforeEach(function () {
            origStreams = {
                main: new Stream(),
                reverse: new Stream()
            };
            streams = new Streams(origStreams);
        });

        it('can be constructed with an Object of Stream values', function () {
            expect(streams instanceof Streams).toBe(true);
        });
        it('can iterate over all streams using .forEach', function () {
            var iteratedStreams = [];
            streams.forEach(function (stream, name) {
                iteratedStreams.push(stream);
            });
            for (var key in origStreams) {
                expect(iteratedStreams.indexOf(origStreams[key])).not.toBe(-1);
            }
        });
        it('starts all streams on .start()', function () {
            spyOn(origStreams.main, 'start').andCallThrough();
            spyOn(origStreams.reverse, 'start').andCallThrough();
            streams.start();
            expect(origStreams.main.start).toHaveBeenCalled();
            expect(origStreams.reverse.start).toHaveBeenCalled();
        });
        it('emits readable whenever a stream is readable', function () {
            var onReadableCallback = jasmine.createSpy();
            streams.on('readable', onReadableCallback);
            origStreams.main.emit('readable');
            origStreams.reverse.emit('readable');
            expect(onReadableCallback).toHaveBeenCalled();
            expect(onReadableCallback.callCount).toBe(2);
        });
    });

    describe('LivefyreCollectionStreams', function () {
        it('can be constructed with opts for a StreamHub Collection', function () {
            var lfStreams = new LivefyreCollectionStreams(livefyreCollectionOpts);
            expect(lfStreams instanceof LivefyreCollectionStreams).toBe(true);
        });
    });

    describe('Hub.Streams.forCollection', function () {
        var streams;
        beforeEach(function () {
            streams = new Hub.Streams.forCollection(livefyreCollectionOpts);
        });
        it("returns a LivefyreCollectionStreams", function () {
            expect(streams instanceof LivefyreCollectionStreams).toBe(true);
            expect(streams instanceof Streams).toBe(true);
        });
    });
});
