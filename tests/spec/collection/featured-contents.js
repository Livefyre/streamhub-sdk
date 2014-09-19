define([
    'streamhub-sdk/collection/featured-contents',
    'streamhub-sdk-tests/mocks/collection/mock-collection',
    'streamhub-sdk/content',
    'streamhub-sdk/collection',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-sdk/collection/streams/featured-archive',
    'stream/readable',
], function (FeaturedContents, MockCollection, Content, Collection, ContentListView, FeaturedArchive, Readable) {
    'use strict';

    describe('streamhub-sdk/collection/featured-contents', function () {
        var collection;
        var featuredContents;

        beforeEach(function () {
            collection = new MockCollection({
                withFeaturedInit: true
            });
        });

        describe('pipe', function () {
            var listView;
            beforeEach(function () {
                listView  = new ContentListView(); // Writable

                featuredContents = new FeaturedContents({
                    collection: new MockCollection()
                });
                featuredContents.createUpdater = function () {
                    var readable = new Readable();
                    readable._read = function () { this.push(null); };
                    return readable;
                };
                featuredContents.createArchive = function () {
                    // Use a Dummy BootstrapClient to prevent requests
                    return FeaturedContents.prototype.createArchive.call(this, {
                        bootstrapClient: {
                            getContent: function (opts, errback) {
                                errback(null, {});
                            }
                        }
                    });
                };
            });

            it('calls createArchive', function () {
                spyOn(featuredContents, 'createArchive').andCallThrough();
                featuredContents.pipe(listView);

                expect(featuredContents.createArchive).toHaveBeenCalled();
            });

            it('calls createUpdater', function () {
                spyOn(featuredContents, 'createUpdater').andCallThrough();
                featuredContents.pipe(listView);

                expect(featuredContents.createUpdater).toHaveBeenCalled();
            });

            describe('when piped to a ContentListView', function () {
                it('pipes an updater to ContentListView', function () {
                    var onPipe = jasmine.createSpy('pipe');
                    listView.on('pipe', onPipe);
                    featuredContents.pipe(listView);
                    expect(onPipe).toHaveBeenCalled();
                });
                it('pipes an archive to ContentListView#more', function () {
                    var onPipeToMore = jasmine.createSpy('pipe to more');
                    listView.more.on('pipe', onPipeToMore);
                    featuredContents.pipe(listView);
                    expect(onPipeToMore).toHaveBeenCalledWith(jasmine.any(FeaturedArchive));
                });
            });
        });

        describe('.createArchive()', function () {

            beforeEach(function () {
                featuredContents = collection.createFeaturedContents();
            });

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
