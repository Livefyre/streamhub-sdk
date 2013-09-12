define([
    'jasmine',
    'streamhub-sdk/collection',
    'streamhub-sdk/streams/collection-archive',
    'streamhub-sdk/streams/collection-updater',
    'streamhub-sdk/views/list-view',
    'stream/writable',
    'stream/readable'
], function (jasmine, Collection, CollectionArchive, CollectionUpdater, ListView,
Writable, Readable) {
    describe('streamhub-sdk/collection', function () {
        it('is a function', function () {
            expect(Collection).toEqual(jasmine.any(Function));
        });
        describe('instance', function () {
            var opts,
                collection;
            beforeEach(function () {
                opts = {
                    network: 'test.fyre.co',
                    siteId: 'testSiteId',
                    articleId: 'testArticleId',
                    environment: 'test.livefyre.com'
                };
                collection = new Collection(opts);
            });

            it('has .network', function () {
                expect(collection.network).toBe(opts.network);
            });
            it('has .siteId', function () {
                expect(collection.siteId).toBe(opts.siteId);
            });
            it('has .articleId', function () {
                expect(collection.articleId).toBe(opts.articleId);
            });
            it('has .environment', function () {
                expect(collection.environment).toBe(opts.environment);
            });

            describe('.createArchive', function () {
                it('returns a readable CollectionArchive Stream', function () {
                    var archive = collection.createArchive();
                    expect(archive instanceof CollectionArchive).toBe(true);
                });
            });

            describe('.createUpdater', function () {
                it('returns a readable CollectionUpdater Stream', function () {
                    var updater = collection.createUpdater();
                    expect(updater instanceof CollectionUpdater).toBe(true);
                });
            });

            describe('.pipe(writable)', function () {
                var writable,
                    listView;
                beforeEach(function () {
                    writable = new Writable();
                    listView = new ListView();
                    collection.createUpdater = function () {
                        var readable = new Readable();
                        readable._read = function () { this.push(null); };
                        return readable;
                    };
                    collection.createArchive = function () {
                        // Use a Dummy BootstrapClient to prevent requests
                        return Collection.prototype.createArchive.call(this, {
                            bootstrapClient: {
                                getContent: function (opts, errback) {
                                    errback(null, {});
                                }
                            }
                        });
                    };
                    writable._write = function (chunk, done) { done(); }
                });
                it('can be piped to a writable', function () {
                    collection.pipe(writable);
                });
                describe('when piped to a ListView', function () {
                    it('pipes an updater to ListView', function () {
                        var onPipe = jasmine.createSpy('pipe');
                        listView.on('pipe', onPipe);
                        collection.pipe(listView);
                        expect(onPipe).toHaveBeenCalled();
                    });
                    it('pipes an archive to ListView#more', function () {
                        var onPipeToMore = jasmine.createSpy('pipe to more');
                        listView.more.on('pipe', onPipeToMore);
                        collection.pipe(listView);
                        expect(onPipeToMore).toHaveBeenCalledWith(jasmine.any(CollectionArchive));
                    });
                });
            });

            describe('.write()', function () {
                var stream;
                var mockWriteResponse = {"status": "ok", "code": 200, "data": {"messages": [{"content": {"replaces": null, "bodyHtml": "<p>oh hi there 2</p>", "annotations": {"moderator": true}, "source": 0, "authorId": "system@labs-t402.fyre.co", "parentId": null, "mentions": [], "shareLink": "http://t402.livefyre.com/.fyreit/w9lbch.4", "id": "26394571", "createdAt": 1363808885}, "vis": 1, "type": 0, "event": null, "source": 0}], "authors": {"system@labs-t402.fyre.co": {"displayName": "system", "tags": [], "profileUrl": "", "avatar": "http://gravatar.com/avatar/e23293c6dfc25b86762b045336233add/?s=50&d=http://d10g4z0y9q0fip.cloudfront.net/a/anon/50.jpg", "type": 1, "id": "system@labs-t402.fyre.co"}}}};
                var mockWriteTweetResponse = {"status": "ok", "code": 200, "data": {"messages": [{"content": {"replaces": "", "bodyHtml": "MAITRE GIMS : \" Les feat dans SUBLIMINAL ces du tres lourd j'veut pas trop m'avanc\u00e9 mais sa seras du tres lourd \"feat avec EMINEM &amp; 50 CENT?", "annotations": {}, "authorId": "471544268@twitter.com", "parentId": "", "updatedAt": 1366839025, "mentions": [], "shareLink": "http://fyre.it/QE0B9G.4", "id": "tweet-308280235000995842@twitter.com", "createdAt": 1366839025}, "vis": 1, "source": 0, "replies": [], "type": 0, "event": null}], "authors": {"471544268@twitter.com": {"displayName": "twinsley yonkou VX", "tags": [], "profileUrl": "https://twitter.com/#!/TismeyJr", "avatar": "http://a0.twimg.com/profile_images/3339939516/bde222e341d477729170a326ca31204e_normal.jpeg", "type": 3, "id": "471544268@twitter.com"}}}};
            
                beforeEach(function () {
                    stream = new LivefyreStream({
                        "network": "labs-t402.fyre.co",
                        "collectionId": "10669131",
                        "commentId": "0"
                    });
                    spyOn(LivefyreWriteClient, 'postContent').andCallFake(function (params, callback) {
                        if (callback) {
                            callback(null, mockWriteResponse);
                        }
                    });
                    spyOn(LivefyreWriteClient, 'postTweet').andCallFake(function (params, callback) {
                        if (callback) {
                            callback(null, mockWriteTweetResponse);
                        }
                    });
                });
            })
        });
    });
});