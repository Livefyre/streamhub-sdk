define([
    'streamhub-sdk/collection/streams/updater',
    'stream/readable',
    'streamhub-sdk/content/state-to-content',
    'streamhub-sdk-tests/mocks/collection/mock-collection',
    'streamhub-sdk-tests/mocks/collection/clients/mock-bootstrap-client',
    'streamhub-sdk-tests/mocks/collection/clients/mock-stream-client',
    'streamhub-sdk/jquery',
    'streamhub-sdk/content/types/livefyre-content'],
function (CollectionUpdater, Readable, StateToContent, MockCollection,
MockLivefyreBootstrapClient, MockLivefyreStreamClient, $, LivefyreContent) {
    "use strict";

    describe('streamhub-sdk/collection/streams/updater', function () {

        describe('when constructed', function () {
            var updater,
                streamClient,
                createStateToContent,
                createAnnotator;

            beforeEach(function () {
                createStateToContent = jasmine.createSpy('createStateToContent')
                    .andCallFake(function(opts) {
                        return CollectionUpdater.prototype._createStateToContent.call(this, opts);
                    });

                createAnnotator = jasmine.createSpy('createAnnotator')
                    .andCallFake(function() {
                        return CollectionUpdater.prototype.createAnnotator.call(this);
                    });

                streamClient = new MockLivefyreStreamClient();
                updater = new CollectionUpdater({
                    collection: new MockCollection(),
                    streamClient: streamClient,
                    createStateToContent: createStateToContent,
                    createAnnotator: createAnnotator
                });
                spyOn(updater._collection._bootstrapClient, 'getContent').andCallThrough();
            });

            afterEach(function () {
                updater.pause();
                StateToContent.Storage.cache = {};
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

            it('can be passed opts.createStateToContent', function () {
                expect(updater._createStateToContent).toEqual(createStateToContent);
            });

            it('can be passed opts.createAnnotator', function () {
                expect(updater.createAnnotator).toEqual(createAnnotator);
            });

            describe('when .read() for the first time', function () {
                var content;
                beforeEach(function () {
                    spyOn(updater._streamClient, 'getContent').andCallThrough();
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
                it('uses opts.createStateToContent', function () {
                    waitsFor(function () {
                        if ( ! content) {
                            content = updater.read();
                        }
                        return content;
                    });
                    runs(function () {
                        expect(createStateToContent).toHaveBeenCalled();
                    });
                });

                it('uses opts.createAnnotator', function () {
                    waitsFor(function () {
                        if ( ! content) {
                            content = updater.read();
                        }
                        return content;
                    });
                    runs(function () {
                        expect(createAnnotator).toHaveBeenCalled();
                    });
                });
            });

            it('uses headDocument.event if set', function (done) {
                // Patch initFromBootstrap to return 0 for latestEvent
                var ogInitFromBootstrap = updater._collection.initFromBootstrap;
                spyOn(updater._collection, 'initFromBootstrap').andCallFake(function (errback) {
                    ogInitFromBootstrap.call(updater._collection, function (err, initData) {
                        initData = $.extend({}, initData);
                        initData.collectionSettings = $.extend({}, initData.collectionSettings);
                        initData.headDocument = $.extend({}, initData.headDocument);
                        initData.collectionSettings.event = 456;
                        initData.headDocument.event = 123;
                        errback(null, initData);
                    });
                });
                updater.read();
                expect(updater._latestEvent).toBe(123);
            });

            it('uses collectionSettings.event if headDocument.event is not set', function () {
                // Patch initFromBootstrap to return 0 for latestEvent
                var ogInitFromBootstrap = updater._collection.initFromBootstrap;
                spyOn(updater._collection, 'initFromBootstrap').andCallFake(function (errback) {
                    ogInitFromBootstrap.call(updater._collection, function (err, initData) {
                        initData = $.extend({}, initData);
                        initData.collectionSettings = $.extend({}, initData.collectionSettings);
                        initData.collectionSettings.event = 456;
                        errback(null, initData);
                    });
                });
                updater.read();
                expect(updater._latestEvent).toBe(456);
            });

            it("streams if initData.latestEvent === 0 (falsy)", function () {
                // Patch initFromBootstrap to return 0 for latestEvent
                var ogInitFromBootstrap = updater._collection.initFromBootstrap;
                spyOn(updater._collection, 'initFromBootstrap').andCallFake(function (errback) {
                    ogInitFromBootstrap.call(updater._collection, function (err, initData) {
                        initData = $.extend({}, initData);
                        initData.collectionSettings = $.extend({}, initData.collectionSettings);
                        initData.collectionSettings.event = 0;
                        errback(null, initData);
                    });
                });
                expect(function () {
                    updater.read();
                }).not.toThrow();
            });

            describe('.pause()', function () {
                it('kills the latest request, and restarts on .resume()', function () {
                    spyOn(updater._streamClient, 'getContent').andCallThrough();
                    var onData = jasmine.createSpy('onData');
                    updater.on('data', onData);
                    waitsFor(function () {
                        return updater._request;
                    });
                    runs(function () {
                        var request = updater._request;
                        spyOn(request, 'abort').andCallThrough();

                        updater.pause();
                        expect(request.abort).toHaveBeenCalled();
                        expect(updater._request).toBe(null);

                        spyOn(updater, '_read').andCallThrough();
                        updater.resume();
                    });
                    waitsFor(function () {
                        return updater._read.callCount;
                    });
                    updater.read(0);
                });
            });

            it(".push()es undefined on stream timeout", function () {
                updater._streamClient.getContent = function (opts, errback) {
                    errback(null, { timeout: true });
                };
                spyOn(updater, 'push');
                var onReadableSpy = jasmine.createSpy;
                updater.on('readable', onReadableSpy);
                updater.read();
                spyOn(updater, 'read');
                waitsFor(function () {
                    return updater.push.callCount;
                });
                runs(function () {
                    expect(updater.push.mostRecentCall.args[0]).toBe(undefined);
                });
                waitsFor(function () {
                    return updater.read.callCount;
                });
                runs(function () {
                    expect(updater.read).toHaveBeenCalledWith(0);
                });
            });

            it("should properly attach attachments, even if the attachment is "+
               "received before its target", function () {
                var parent = {"vis":1,"content":{"replaces":"","bodyHtml":"<a vocab=\"http://schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:14268796\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https://twitter.com/#!/TheRoyalty\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">TheRoyalty</span></a> hoppin on a green frog after the set at <a vocab=\"http://schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:1240466234\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https://twitter.com/#!/Horseshoe_SX13\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">Horseshoe_SX13</span></a> showcase during <a href=\"https://twitter.com/#!/search/realtime/%23sxsw\" class=\"fyre-hashtag\" hashtag=\"sxsw\" rel=\"tag\" target=\"_blank\">#sxsw</a> <a href=\"http://t.co/lUqA5TT7Uy\" target=\"_blank\" rel=\"nofollow\">pic.twitter.com/lUqA5TT7Uy</a>","annotations":{},"authorId":"190737922@twitter.com","parentId":"","updatedAt":1363299774,"id":"tweet-312328006913904641@twitter.com","createdAt":1363299774},"source":1,"lastVis":0,"type":0,"event":1363299777181024};
                var attachment = {"vis":1,"content":{"targetId":"tweet-312328006913904641@twitter.com","authorId":"-","link":"http://twitter.com/PlanetLA_Music/status/312328006913904641/photo/1","oembed":{"provider_url":"http://twitter.com","title":"Twitter / PlanetLA_Music: @TheRoyalty hoppin on a green ...","url":"","type":"rich","html":"<blockquote class=\"twitter-tweet\"><a href=\"https://twitter.com/PlanetLA_Music/status/312328006913904641\"></a></blockquote><script async src=\"//platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>","author_name":"","height":0,"thumbnail_width":568,"width":0,"version":"1.0","author_url":"","provider_name":"Twitter","thumbnail_url":"https://pbs.twimg.com/media/BFWcquJCUAA7orG.jpg","thumbnail_height":568},"position":3,"id":"oem-3-tweet-312328006913904641@twitter.com"},"source":1,"lastVis":0,"type":3,"event":1363299777193595};
                var callCount = 0;
                spyOn(updater._streamClient, 'getContent').andCallFake(function (opts, errback) {
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
                    setTimeout(function () {
                        errback(null, { timeout: true });
                    }, 30 * 1000);

                    return $.ajax();
                });

                var onData = jasmine.createSpy();
                updater.on('data', onData);

                waitsFor(function () {
                    return onData.callCount;
                }, "the 'data' event should be caught and handled");

                runs(function () {
                    var content = onData.mostRecentCall.args[0];
                    expect(content.id).toBe(parent.content.id);
                    expect(content.attachments.length).toBe(1);
                    expect(content.attachments[0].id).toBe(attachment.content.id);
                });
            });

            it("should not emit Content from states that are not visible", function () {
                var nonVisState = {"erefs":["PF48kezy4YAeCjXtsYv379JcxaqFjgt1J0n89+ixAF26p+hMnmyimWdVuE6oofxWzXmoQYdFsBZ3+1IpUXEh+C5tPkcyZbDTRzYgPgU1ZN/0OdbNJpw="],"source":1,"content":{"replaces":"","id":"tweet-351026197783785472@twitter.com","createdAt":1372526142,"parentId":""},"vis":2,"type":0,"event":1372526143230762,"childContent":[]};
                var callCount = 0;
                spyOn(updater._streamClient, 'getContent').andCallFake(function (opts, errback) {
                    var states = {};
                    callCount++;
                    if (callCount === 1) {
                        states[nonVisState.content.id] = nonVisState;
                        return errback(null, {
                            states: states
                        });
                    }
                    // Then return timeouts every 30s
                    setTimeout(function () {
                        errback(null, { timeout: true });
                    }, 30 * 1000);

                    return $.ajax();
                });
                var content = updater.read();
                expect(content).toBe(null);
            });

            it('emits readable after a .readable listener is added', function () {
                var onReadableSpy = jasmine.createSpy('CollectionUpdater#onReadable');
                updater.on('readable', onReadableSpy);
                waitsFor(function () {
                    return onReadableSpy.callCount;
                });
                runs(function () {
                    expect(onReadableSpy).toHaveBeenCalled();
                });
            });

            it('can .read() content from the stream', function () {
                spyOn(updater, '_read').andCallThrough();
                var contents = [];

                updater.on('data', function (content) {
                    contents.push(content);
                });

                waitsFor(function () {
                    return contents.length;
                });

                runs(function () {
                    updater.pause();
                    expect(updater._read.callCount).toBe(2);
                    // There is one attachment state and one content state in the stream,
                    // so only one content item will be emitted, but it will have an attachment
                    expect(contents.length).toBe(1);
                });
            });

            it('can .read() annotations from the stream', function () {
                var id = 'ContentInStorage123';
                var content = new LivefyreContent({});
                content.id = id;
                content.collection = {
                    id: 10739960
                }
                var Storage = StateToContent.Storage;
                expect(content.getFeaturedValue()).toEqual(undefined);

                Storage.set(Storage.keys.content(content), content);

                spyOn(updater, '_read').andCallThrough();
                var contents = [];

                updater.on('data', function (content) {
                    contents.push(content);
                });

                waitsFor(function () {
                    return contents.length;
                });

                runs(function () {
                    updater.pause();
                    var featuredContent = Storage.get(Storage.keys.content(content));
                    expect(featuredContent.getFeaturedValue()).toEqual(jasmine.any(Number));
                });
            });
        });

        it('reads out replies when constructed with opts.replies = true', function () {
            var streamClient = new MockLivefyreStreamClient();
            var updater = new CollectionUpdater({
                collection: new MockCollection(),
                streamClient: streamClient,
                replies: true
            });
            var stateToContent = updater._createStateToContent();
            expect(stateToContent._replies).toBe(true);
        });

        it('retries when encountering stream errors, up to opts.maxErrors', function () {
            var MAX_ERRORS = 3;
            var errorsSoFar = 0;
            var streamClient = new MockLivefyreStreamClient();

            // patch streamClient to return errors
            streamClient.getContent = (function (ogGetContent) {
                return function (opts, errback) {
                    errorsSoFar = errorsSoFar + 1;
                    if (errorsSoFar <= MAX_ERRORS) {
                        return errback({
                            status: 500,
                            message: 'Fake test error'
                        });
                    }
                    // okay done MAX_ERRORS. If one more error happens, this
                    // should trigger an 'error' event
                    if (errorsSoFar === (MAX_ERRORS + 1)) {
                        return errback({
                            status: 500,
                            message: 'fake test error. one more than max'
                        });
                    }
                    // do normal
                    return ogGetContent.apply(this, arguments);
                };
            }(streamClient.getContent));
            // and spy
            spyOn(streamClient, 'getContent').andCallThrough();

            var updater = new CollectionUpdater({
                collection: new MockCollection(),
                streamClient: streamClient,
                replies: true,
                maxErrors: MAX_ERRORS
            });
            var onErrorSpy = jasmine.createSpy();
            updater.on('error', onErrorSpy);
            updater._getTimeoutAfterError = function () {
                // always do 1 so this test doesn't take forever
                return 1;
            }
            updater.on('data', function onData(d) {
                updater.removeListener('data', onData);
                updater.pause();
            });
            waitsFor(function () {
                return errorsSoFar >= MAX_ERRORS;
            });
            runs(function () {
                // waitsFor is fuzzy so this could be 4 or 3
                expect(errorsSoFar >= MAX_ERRORS).toBe(true);
                // +1 original call that triggered initial error
                expect(streamClient.getContent.callCount).toBe(MAX_ERRORS + 1);
            });
            waitsFor(function () {
                return onErrorSpy.callCount;
            });
            runs(function () {
                expect(onErrorSpy.callCount).toBe(1);
                expect(errorsSoFar).toBe(MAX_ERRORS + 1);
                // no more long polls should have happened
                expect(streamClient.getContent.callCount).toBe(MAX_ERRORS + 1);
            });
        });

        it('does the right thing if it encounters a loop in the stream', function () {
            /**
             * We're going to poll three times normally,
             * then the third time will be a loop whose event is the second
             *   value.
             */
            var events = [10,20,30,20,40,50,60,50,80].map(function (e) {
                // make all higher than initial event
                return e + 1372807378824134;
            });
            var numEvents = events.length;
            var streamClient = new MockLivefyreStreamClient();

            // patch streamClient to return errors
            var i = 0;
            streamClient.getContent = (function (ogGetContent) {
                return function (opts, errback) {
                    var eventId = events.shift();
                    if (eventId) {
                        return errback(null, {
                            maxEventId: eventId
                        })
                    }
                    // do normal
                    return ogGetContent.apply(this, arguments);
                };
            }(streamClient.getContent));
            // and spy
            spyOn(streamClient, 'getContent').andCallThrough();

            var updater = new CollectionUpdater({
                collection: new MockCollection(),
                streamClient: streamClient,
                replies: true
            });
            updater._getTimeoutAfterError = function () {
                // always do 1 so this test doesn't take forever
                return 1;
            }
            updater.on('data', function onData(d) {
                updater.removeListener('data', onData);
                updater.pause();
            });
            waitsFor(function () {
                return events.length === 0;
            });
            runs(function () {
                updater.pause();
                expect(streamClient.getContent.calls.length).toBe(numEvents + 1);
                expectHandlesLoop(streamClient.getContent.calls, 3);
                expectHandlesLoop(streamClient.getContent.calls, 7);
                
                function expectHandlesLoop(calls, whichCallRespondsWithLoop) {
                    var callThatRespondsWithLoop = calls[whichCallRespondsWithLoop]; 
                    var commentIdThatRespondsWithLoop = callThatRespondsWithLoop.args[0].commentId;
                    var callAfterLoop = calls[whichCallRespondsWithLoop + 1];
                    expect(callAfterLoop.args[0].commentId).toBe(commentIdThatRespondsWithLoop + 1);
                }
            });
        });

    });
});
