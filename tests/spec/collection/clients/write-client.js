define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/collection/clients/write-client'],
function ($, LivefyreWriteClient) {
    'use strict';

    describe('streamhub-sdk/collection/clients/write-client', function () {
        var mockData, writeClient;

        beforeEach(function() {
            writeClient = new LivefyreWriteClient();
            mockData = {"status": "ok", "code": 200, "data": {"messages": [{"content": {"replaces": null, "bodyHtml": "<p>oh hi there 2</p>", "annotations": {"moderator": true}, "source": 0, "authorId": "system@labs-t402.fyre.co", "parentId": null, "mentions": [], "shareLink": "http://t402.livefyre.com/.fyreit/w9lbch.4", "id": "26394571", "createdAt": 1363808885}, "vis": 1, "type": 0, "event": null, "source": 0}], "authors": {"system@labs-t402.fyre.co": {"displayName": "system", "tags": [], "profileUrl": "", "avatar": "http://gravatar.com/avatar/e23293c6dfc25b86762b045336233add/?s=50&d=http://d10g4z0y9q0fip.cloudfront.net/a/anon/50.jpg", "type": 1, "id": "system@labs-t402.fyre.co"}}}};

            spyOn(writeClient, '_request').andCallFake(function(opts, errback) {
                return $.ajax().success(function () {
                    errback(null, mockData);
                });
            });
        });

        it("is a constructor", function () {
            expect(LivefyreWriteClient).toEqual(jasmine.any(Function));
            expect(new LivefyreWriteClient() instanceof LivefyreWriteClient).toBe(true);
        });

        describe('when constructed with opts.protocol=https', function () {
            var writeClient;
            beforeEach(function () {
                writeClient = new LivefyreWriteClient({
                    protocol: 'https'
                });
                spyOn(writeClient, '_request').andCallFake(function (opts, errback) {
                    return $.ajax().success(function (data) {
                        errback(null, data);
                    });
                });
            });
            it('.postContent makes requests to the right https URL', function () {
                var onResponse = jasmine.createSpy();
                writeClient.postContent({
                    "network": "labs-t402.fyre.co",
                    "collectionId": "33129653",
                    "body": "oh <strong>hi</strong> there",
                    "lftoken": "my token"
                }, onResponse);

                waitsFor(function () {
                    return onResponse.callCount;
                });

                runs(function () {
                    var ajaxArgs = writeClient._request.mostRecentCall.args[0];
                    expect(ajaxArgs.url).toBe('https://labs-t402.quill.fyre.co/api/v3.0/collection/33129653/post/');
                });
            });
        });

        it ("should post data when postContent is called", function () {
            var callback = jasmine.createSpy();
            var opts = {
                "network": "labs-t402.fyre.co",
                "collectionId": "33129653",
                "body": "oh <strong>hi</strong> there",
                "lftoken": "my token"
            };
            writeClient.postContent(opts, callback);
    
            waitsFor(function() {
                return callback.callCount > 0;
            });
            runs(function() {
                var ajaxArgs = writeClient._request.mostRecentCall.args[0];
                expect(ajaxArgs.url).toBe("http://quill.labs-t402.fyre.co/api/v3.0/collection/33129653/post/");
                expect(ajaxArgs.data.body).toBe("oh <strong>hi</strong> there");
                expect(ajaxArgs.data.lftoken).toBe("my token");
                expect(callback).toHaveBeenCalled();
                expect(callback.callCount).toBe(1);
                expect(callback.mostRecentCall.args[0]).toBeNull();
                expect(callback.mostRecentCall.args[1]).toBeDefined();
                expect(callback.mostRecentCall.args[1]).toBe(mockData);
            });
        });

        it ("should post media attachments", function () {
            var callback = jasmine.createSpy();
            var opts = {
                "network": "labs-t402.fyre.co",
                "collectionId": "33129653",
                "body": "oh <strong>hi</strong> there",
                "lftoken": "my token"
            };
            opts.attachments = [{
                version: "1.0",
                type: "photo",
                url: "http://distilleryimage10.instagram.com/386628d690c511e2bf9022000a1fb723_6.jpg"
            },{
                version: "1.0",
                type: "photo",
                url: "http://d.pr/i/CBpa+"
            }];
            writeClient.postContent(opts, callback);
            waitsFor(function() {
                return callback.callCount > 0;
            });
            runs(function() {
                var ajaxArgs = writeClient._request.mostRecentCall.args[0];
                expect(ajaxArgs.url).toBe("http://quill.labs-t402.fyre.co/api/v3.0/collection/33129653/post/");
                expect(ajaxArgs.data.body).toBe("oh <strong>hi</strong> there");
                expect(ajaxArgs.data.lftoken).toBe("my token");
                expect(ajaxArgs.data.media).toBe(JSON.stringify(opts.media));
                expect(callback).toHaveBeenCalled();
                expect(callback.callCount).toBe(1);
                expect(callback.mostRecentCall.args[0]).toBeNull();
                expect(callback.mostRecentCall.args[1]).toBeDefined();
                expect(callback.mostRecentCall.args[1]).toBe(mockData);
            });
        });
    });
});