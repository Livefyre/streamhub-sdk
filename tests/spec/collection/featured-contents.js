define([
    'jasmine',
    'streamhub-sdk/collection/featured-contents',
    'streamhub-sdk-tests/mocks/collection/mock-collection',
    'streamhub-sdk/content',
    'stream/readable'
], function (jasmine, FeaturedContents, MockCollection, Content, Readable) {
    'use strict';

    describe('streamhub-sdk/collection/featured-contents', function () {
        var collection;
        var featuredContents;
        beforeEach(function () {
            collection = new MockCollection({
                withFeaturedInit: true
            });
            featuredContents = collection.createFeaturedContents();
        });

        describe('.createArchive()', function () {
            it('returns a readable FeaturedArchive Stream', function () {
                var featuredArchive = featuredContents.createArchive({
                    bootstrapClient: collection._bootstrapClient
                });
                expect(featuredArchive instanceof Readable).toBe(true);
                var onEnd = jasmine.createSpy('on end');
                featuredArchive.on('end', onEnd);
                // Everything should be Content and isFeatured
                featuredArchive.on('data', function (content) {
                    expect(content instanceof Content).toBe(true);
                    expect(content.isFeatured()).toBe(true);
                });
                waitsFor(function () {
                    return onEnd.callCount;
                }, 'featured archive stream to end');
            });

            it('constructs FeaturedArchive with a custom bootstrapClient, if provided', function () {
                var bootstrapClient = { custom: true };
                var featured = featuredContents.createArchive({
                    bootstrapClient: bootstrapClient
                });
                expect(featured._bootstrapClient).toBe(bootstrapClient);
            });
        });
    });
});