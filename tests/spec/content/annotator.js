define([
    'streamhub-sdk/content/annotator',
    'stream/writable',
    'streamhub-sdk/content/types/livefyre-content',
    'json!streamhub-sdk-tests/mocks/bootstrap-data.json'],
function (Annotator, Writable, LivefyreContent, mockBootstrapData) {
    'use strict';

    describe('streamhub-sdk/content/annotator', function () {
        it('is a Writable', function () {
            expect(Annotator.prototype instanceof Writable).toBe(true);
        });

        var featuredmessage = { "featuredmessage": { "rel_collectionId": "10739960", "value": 1381771896 }};
        var moderatorTrue = {"moderator": true};


        describe('Annotator#annotate', function () {
            var lfContent = new LivefyreContent({});

            it('can add featuredmessage annotations', function () {
                Annotator.annotate(lfContent, {
                    'added': featuredmessage
                });

                expect(lfContent.getFeaturedValue()).toEqual(jasmine.any(Number));
            });

            it('can remove featuredmessage annotations', function () {
                Annotator.annotate(lfContent, {
                    'removed': featuredmessage
                });

                expect(lfContent.getFeaturedValue()).toEqual(undefined);
            });

            it('can add moderater annotations', function () {
                Annotator.annotate(lfContent, {
                    'added': moderatorTrue
                });

                expect(lfContent.moderator).toEqual(true);
            });

            it('can remove moderater annotations', function () {
                Annotator.annotate(lfContent, {
                    'removed': moderatorTrue
                });

                expect(lfContent.moderator).toEqual(false);
            });
        });
    });
});
