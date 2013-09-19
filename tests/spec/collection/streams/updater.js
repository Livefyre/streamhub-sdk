define([
    'jasmine',
    'streamhub-sdk/collection/streams/updater',
    'stream/readable',
    'streamhub-sdk/content/state-to-content',
    'streamhub-sdk-tests/mocks/collection/mock-collection',
    'streamhub-sdk-tests/mocks/collection/clients/mock-bootstrap-client',
    'streamhub-sdk-tests/mocks/collection/clients/mock-stream-client'],
function (jasmine, CollectionUpdater, Readable, StateToContent, MockCollection,
MockLivefyreBootstrapClient, MockLivefyreStreamClient) {
    "use strict";

    describe('streamhub-sdk/collection/streams/updater', function () {

        describe('when constructed', function () {
            var updater,
                streamClient;

            beforeEach(function () {
                streamClient = new MockLivefyreStreamClient();
                StateToContent.Storage.cache = {};
                updater = new CollectionUpdater({
                    collection: new MockCollection(),
                    streamClient: streamClient
                });
                spyOn(updater._collection._bootstrapClient, 'getContent').andCallThrough();
                spyOn(updater._streamClient, 'getContent').andCallThrough();
            });

            it('is instanceof CollectionUpdater', function () {
                expect(updater instanceof CollectionUpdater).toBe(true);
            });

            it('is instanceof Readable', function () {
                expect(updater instanceof Readable).toBe(true);
                expect(updater.readable).toBe(true);
            });

            it('can be passed opts.streamClient', function () {
                expect(updater._streamClient).toBe(streamClient);
            });

            describe('when .read() for the first time', function () {
                var content;
                beforeEach(function () {
                    content = updater.read();
                });
                it('requests bootstrap init', function () {
                    expect(
                        updater._collection._bootstrapClient.getContent.callCount).toBe(1);
                    expect(updater._collection._bootstrapClient.getContent)
                        .toHaveBeenCalledWith(jasmine.any(Object),
                                              jasmine.any(Function));
                });
                it('requests from .streamClient after init', function () {
                    expect(updater._streamClient.getContent.callCount).toBe(1);
                });
                it('emits Content with an .author', function () {
                    waitsFor(function () {
                        if ( ! content) {
                            content = updater.read();
                        }
                        return content;
                    });
                    runs(function () {
                        expect(content.author).toEqual(jasmine.any(Object));
                        expect(content.author.displayName)
                            .toEqual(jasmine.any(String));
                    });
                });
            });

            it("should properly attach attachments, even if the attachment is "+
               "received before its target", function () {
                var parent = {"vis":1,"content":{"replaces":"","bodyHtml":"<a vocab=\"http://schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:14268796\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https://twitter.com/#!/TheRoyalty\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">TheRoyalty</span></a> hoppin on a green frog after the set at <a vocab=\"http://schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:1240466234\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https://twitter.com/#!/Horseshoe_SX13\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">Horseshoe_SX13</span></a> showcase during <a href=\"https://twitter.com/#!/search/realtime/%23sxsw\" class=\"fyre-hashtag\" hashtag=\"sxsw\" rel=\"tag\" target=\"_blank\">#sxsw</a> <a href=\"http://t.co/lUqA5TT7Uy\" target=\"_blank\" rel=\"nofollow\">pic.twitter.com/lUqA5TT7Uy</a>","annotations":{},"authorId":"190737922@twitter.com","parentId":"","updatedAt":1363299774,"id":"tweet-312328006913904641@twitter.com","createdAt":1363299774},"source":1,"lastVis":0,"type":0,"event":1363299777181024};
                var attachment = {"vis":1,"content":{"targetId":"tweet-312328006913904641@twitter.com","authorId":"-","link":"http://twitter.com/PlanetLA_Music/status/312328006913904641/photo/1","oembed":{"provider_url":"http://twitter.com","title":"Twitter / PlanetLA_Music: @TheRoyalty hoppin on a green ...","url":"","type":"rich","html":"<blockquote class=\"twitter-tweet\"><a href=\"https://twitter.com/PlanetLA_Music/status/312328006913904641\"></a></blockquote><script async src=\"//platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>","author_name":"","height":0,"thumbnail_width":568,"width":0,"version":"1.0","author_url":"","provider_name":"Twitter","thumbnail_url":"https://pbs.twimg.com/media/BFWcquJCUAA7orG.jpg","thumbnail_height":568},"position":3,"id":"oem-3-tweet-312328006913904641@twitter.com"},"source":1,"lastVis":0,"type":3,"event":1363299777193595};
                updater._streamClient = {
                    getContent: jasmine.createSpy().andCallFake((function () {
                        var callCount = 0;
                        return function (opts, errback) {
                            var states = {};
                            callCount++;
                            if (callCount === 1) {
                                // Return an attachment on the first call
                                states[attachment.content.id] = attachment;
                                return errback(null, {
                                    states: states
                                });
                            } else if (callCount === 2) {
                                // Return its parent on the second call
                                states[parent.content.id] = parent;
                                return errback(null, {
                                    states: states
                                });
                            }
                            // Then return timeouts every 30s
                            return setTimeout(function () {
                                errback(null, { timeout: true });
                            }, 30 * 1000);
                        };
                    }()))
                };

                var content = updater.read();
                expect(content.id).toBe(parent.content.id);
                expect(content.attachments.length).toBe(1);
                expect(content.attachments[0].id).toBe(attachment.content.id);
            });

            it("should not emit Content from states that are not visible", function () {
                var nonVisState = {"erefs":["PF48kezy4YAeCjXtsYv379JcxaqFjgt1J0n89+ixAF26p+hMnmyimWdVuE6oofxWzXmoQYdFsBZ3+1IpUXEh+C5tPkcyZbDTRzYgPgU1ZN/0OdbNJpw="],"source":1,"content":{"replaces":"","id":"tweet-351026197783785472@twitter.com","createdAt":1372526142,"parentId":""},"vis":2,"type":0,"event":1372526143230762,"childContent":[]};
                updater._streamClient = {
                    getContent: jasmine.createSpy().andCallFake((function () {
                        var callCount = 0;
                        return function (opts, errback) {
                            var states = {};
                            callCount++;
                            if (callCount === 1) {
                                states[nonVisState.content.id] = nonVisState;
                                return errback(null, {
                                    states: states
                                });
                            }
                            // Then return timeouts every 30s
                            return setTimeout(function () {
                                errback(null, { timeout: true });
                            }, 30 * 1000);
                        };
                    }()))
                };
                var content = updater.read();
                expect(content).toBe(null);
            });

            describe('and a .readable listener is added', function () {
                var onReadableSpy;
                beforeEach(function () {
                    onReadableSpy = jasmine.createSpy('CollectionUpdater#onReadable');
                    updater.on('readable', onReadableSpy);
                });
                it('emits readable', function () {
                    waitsFor(function () {
                        return onReadableSpy.callCount;
                    });
                    runs(function () {
                        expect(onReadableSpy).toHaveBeenCalled();
                    });
                });

                describe('and readable is emitted', function () {
                    beforeEach(function () {
                        spyOn(updater, '_read').andCallThrough();
                        waitsFor(function () {
                            return onReadableSpy.callCount;
                        });
                    });

                    it('can .read() content from the stream', function () {
                        var contents = [],
                            content;

                        waitsFor(function () {
                            content = updater.read();
                            if (content) {
                                contents.push(content);
                                // Try to read more data, so that _read is called
                                // again
                                updater.read();
                            }
                            return contents.length;
                        });

                        runs(function () {
                            // There is one attachment state and one content state in the stream,
                            // so only one content item will be emitted, but it will have an attachment
                            expect(contents.length).toBe(1);
                            expect(contents[0].attachments.length).toBe(1);
                        });

                        waitsFor(function () {
                            return updater._read.callCount === 2;
                        }, '_read to be called twice');

                        runs(function () {
                            updater.pause();
                            expect(updater._read.callCount).toBe(2);
                        });
                    });
                });
            });
        });
    });
});