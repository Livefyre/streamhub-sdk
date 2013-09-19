define([
    'streamhub-sdk/jquery',
    'jasmine',
    'streamhub-sdk/collection/clients/write-client',
    'jasmine-jquery'],
function ($, jasmine, LivefyreWriteClient) {
    'use strict';

    describe('streamhub-sdk/collection/clients/write-client', function () {
        var spy, mockData, callback, opts, writeClient;

        beforeEach(function() {
            writeClient = new LivefyreWriteClient();
            mockData = {"status": "ok", "code": 200, "data": {"messages": [{"content": {"replaces": null, "bodyHtml": "<p>oh hi there 2</p>", "annotations": {"moderator": true}, "source": 0, "authorId": "system@labs-t402.fyre.co", "parentId": null, "mentions": [], "shareLink": "http://t402.livefyre.com/.fyreit/w9lbch.4", "id": "26394571", "createdAt": 1363808885}, "vis": 1, "type": 0, "event": null, "source": 0}], "authors": {"system@labs-t402.fyre.co": {"displayName": "system", "tags": [], "profileUrl": "", "avatar": "http://gravatar.com/avatar/e23293c6dfc25b86762b045336233add/?s=50&d=http://d10g4z0y9q0fip.cloudfront.net/a/anon/50.jpg", "type": 1, "id": "system@labs-t402.fyre.co"}}}};

            spy = spyOn($, "ajax").andCallFake(function(opts) {
                expect(opts.url).toBe("http://quill.labs-t402.fyre.co/api/v3.0/collection/33129653/post/");
                expect(opts.data.body).toBe("oh <strong>hi</strong> there");
                expect(opts.data.lftoken).toBe("my token");
                opts.success(mockData);
            });
            
            callback = jasmine.createSpy();
            opts = {
                "network": "labs-t402.fyre.co",
                "collectionId": "33129653",
                "body": "oh <strong>hi</strong> there",
                "lftoken": "my token"
            };
        });

        it("is a constructor", function () {
            expect(LivefyreWriteClient).toEqual(jasmine.any(Function));
            expect(new LivefyreWriteClient() instanceof LivefyreWriteClient).toBe(true);
        });
        
        it ("should post data when postContent is called", function () {
            writeClient.postContent(opts, callback);
    
            waitsFor(function() {
                return callback.callCount > 0;
            });
            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(callback.callCount).toBe(1);
                expect(callback.mostRecentCall.args[0]).toBeNull();
                expect(callback.mostRecentCall.args[1]).toBeDefined();
                expect(callback.mostRecentCall.args[1]).toBe(mockData);
            });
        });

        it ("should post media attachments", function () {
            opts.media = [{
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
                expect($.ajax.mostRecentCall.args[0].data.media).toBe(JSON.stringify(opts.media));
                expect(callback).toHaveBeenCalled();
                expect(callback.callCount).toBe(1);
                expect(callback.mostRecentCall.args[0]).toBeNull();
                expect(callback.mostRecentCall.args[1]).toBeDefined();
                expect(callback.mostRecentCall.args[1]).toBe(mockData);
            });
        });
    });
});