define([
    'jasmine',
    'streamhub-sdk/collection/streams/featured-archive',
    'streamhub-sdk-tests/mocks/collection/mock-collection',
    'stream/readable'],
function (jasmine, FeaturedArchive, MockCollection, Readable) {
    'use strict';

    describe('streamhub-sdk/streams/featured-content', function () {

        it('can be constructed with a Collection', function () {
            var collection = new MockCollection({
                withFeaturedInit: true
            });
            var featuredContents = new FeaturedArchive({
                collection: collection,
                bootstrapClient: collection._bootstrapClient
            });
            expect(featuredContents instanceof FeaturedArchive);
            expect(featuredContents._collection).toBe(collection);
        });

        it('emits readable and reads out items from bootstrapInit.featured', function () {
            var collection = new MockCollection({
                withFeaturedInit: true
            });
            var featuredContents = new FeaturedArchive({
                collection: collection,
                bootstrapClient: collection._bootstrapClient
            });
            var onReadable = jasmine.createSpy('on readable');
            featuredContents.on('readable', onReadable);
            waitsFor(function () {
                return onReadable.callCount;
            });
            runs(function () {
                var content = featuredContents.read();
                expect(content.isFeatured()).toBe(true);
            });
        });

        it('reads out from featured-all.json after reading from init', function () {
            // This MockCollection has no featured Content
            var collection = new MockCollection({
                withFeaturedInit: true
            });

            var bootstrapClient = collection._bootstrapClient;

            var featuredContents = new FeaturedArchive({
                collection: collection,
                bootstrapClient: bootstrapClient
            });

            // Spy on the BootstrapClient to ensure featured-all is requested
            spyOn(bootstrapClient, 'getContent').andCallThrough();

            var onEnd = jasmine.createSpy('onEnd');
            var onData = jasmine.createSpy('onData');
            featuredContents.on('end', onEnd);
            featuredContents.on('data', onData);
            waitsFor(function () {
                return onEnd.callCount;
            });
            runs(function () {
                var latestBootstrapArgs = bootstrapClient.getContent.mostRecentCall.args[0];
                expect(latestBootstrapArgs.page).toBe('featured-all');
            });
        });
        
        it('does not emit duplicates across featured-all and init', function () {
            // This MockCollection has no featured Content
            var collection = new MockCollection({
                withFeaturedInit: true
            });

            var featuredCount = null;
            collection.on('_initFromBootstrap', function (err, initData) {
                featuredCount = initData.featured.size;
            });

            var featuredContents = new FeaturedArchive({
                collection: collection,
                bootstrapClient: collection._bootstrapClient
            });
            var onEnd = jasmine.createSpy('onEnd');
            var onData = jasmine.createSpy('onData');
            featuredContents.on('end', onEnd);
            featuredContents.on('data', onData);
            waitsFor(function () {
                return onEnd.callCount;
            });
            runs(function () {
                // Data from both init and featured-all should have been
                // emitted, but not duplicates
                expect(onData.callCount).toBe(featuredCount);
            });
        });

        it('emits end immediately if there is no featured Content', function () {
            // This MockCollection has no featured Content
            var collection = new MockCollection();
            var featuredContents = new FeaturedArchive({
                collection: collection,
                bootstrapClient: collection._bootstrapClient
            });
            var onEnd = jasmine.createSpy('onEnd');
            var onData = jasmine.createSpy('onData');
            featuredContents.on('end', onEnd);
            featuredContents.on('data', onData);
            waitsFor(function () {
                return onEnd.callCount;
            });
            runs(function () {
                // No data should have been emitted
                expect(onData.callCount).toBe(0);
            });
        });

        it('emits end when there are no more featured Contents', function () {
            // This MockCollection has no featured Content
            var collection = new MockCollection({
                withFeaturedInit: true
            });

            var featuredCount = null;
            collection.on('_initFromBootstrap', function (err, initData) {
                featuredCount = initData.featured.size;
            });

            var featuredContents = new FeaturedArchive({
                collection: collection,
                bootstrapClient: collection._bootstrapClient
            });
            var onEnd = jasmine.createSpy('onEnd');
            var onData = jasmine.createSpy('onData');
            featuredContents.on('end', onEnd);
            featuredContents.on('data', onData);
            waitsFor(function () {
                return onEnd.callCount;
            }, 'end to be called');
        });
    });
});