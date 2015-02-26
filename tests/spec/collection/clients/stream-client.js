define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/collection/clients/stream-client'],
function ($, LivefyreStreamClient) {
    'use strict';

    describe('streamhub-sdk/collection/clients/stream-client', function () {
        var spy, mockData, callback, opts, streamClient;
        
        beforeEach(function() {
            mockData = {"states":{"tweet-312328006913904641@twitter.com":{"vis":1,"content":{"replaces":"","bodyHtml":"<a vocab=\"http://schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:14268796\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https://twitter.com/#!/TheRoyalty\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">TheRoyalty</span></a> hoppin on a green frog after the set at <a vocab=\"http://schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:1240466234\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https://twitter.com/#!/Horseshoe_SX13\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">Horseshoe_SX13</span></a> showcase during <a href=\"https://twitter.com/#!/search/realtime/%23sxsw\" class=\"fyre-hashtag\" hashtag=\"sxsw\" rel=\"tag\" target=\"_blank\">#sxsw</a> <a href=\"http://t.co/lUqA5TT7Uy\" target=\"_blank\" rel=\"nofollow\">pic.twitter.com/lUqA5TT7Uy</a>","annotations":{},"authorId":"190737922@twitter.com","parentId":"","updatedAt":1363299774,"id":"tweet-312328006913904641@twitter.com","createdAt":1363299774},"source":1,"lastVis":0,"type":0,"event":1363299777181024},"oem-3-tweet-312328006913904641@twitter.com":{"vis":1,"content":{"targetId":"tweet-312328006913904641@twitter.com","authorId":"-","link":"http://twitter.com/PlanetLA_Music/status/312328006913904641/photo/1","oembed":{"provider_url":"http://twitter.com","title":"Twitter / PlanetLA_Music: @TheRoyalty hoppin on a green ...","url":"","type":"rich","html":"<blockquote class=\"twitter-tweet\"><a href=\"https://twitter.com/PlanetLA_Music/status/312328006913904641\"></a></blockquote><script async src=\"//platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>","author_name":"","height":0,"thumbnail_width":568,"width":0,"version":"1.0","author_url":"","provider_name":"Twitter","thumbnail_url":"https://pbs.twimg.com/media/BFWcquJCUAA7orG.jpg","thumbnail_height":568},"position":3,"id":"oem-3-tweet-312328006913904641@twitter.com"},"source":1,"lastVis":0,"type":3,"event":1363299777193595}},"authors":{"190737922@twitter.com":{"displayName":"PlanetLA_Music","tags":[],"profileUrl":"https://twitter.com/#!/PlanetLA_Music","avatar":"http://a0.twimg.com/profile_images/1123786999/PLAnew-logo_normal.jpg","type":3,"id":"190737922@twitter.com"}},"jsver":"10026","maxEventId":1363299777193595};
            streamClient = new LivefyreStreamClient();

            spy = spyOn(streamClient, "_request").andCallFake(function(opts, errback) {
                return $.ajax().success(function () {
                    errback(null, {"data": mockData});
                });
            });
            
            callback = jasmine.createSpy();
            opts = {
                "network": "labs-t402.fyre.co",
                "collectionId": "10669131",
                "commentId": "0"
            };
        });

        it("is a constructor", function () {
            expect(LivefyreStreamClient).toEqual(jasmine.any(Function));
            expect(new LivefyreStreamClient() instanceof LivefyreStreamClient).toBe(true);
        });

        it("should make requests to the right URL", function () {
            streamClient.getContent(opts, callback);
            expect(streamClient._request.mostRecentCall.args[0].url).toBe("http://stream1.labs-t402.fyre.co/v3.1/collection/10669131/0/?backend=streamhub-sdk");
        });

        describe('when constructed with opts.protocol=https', function () {
            var streamClient;
            beforeEach(function () {
                streamClient = new LivefyreStreamClient({
                    protocol: 'https'
                });
                spyOn(streamClient, '_request');
            });
            it('should make requests to the right https URL', function () {
                var opts = {
                    network: 'backplane-qa.fyre.co',
                    collectionId: '2486639',
                    environment: 'qa-ext.livefyre.com'
                };
                streamClient.getContent(opts, callback);
                expect(streamClient._request.mostRecentCall.args[0].url).toBe("https://backplane-qa.stream1.fyre.co/v3.1/collection/2486639/0/?backend=streamhub-sdk");
            });
        });

        it ("should return data when getContent is called", function () {
            streamClient.getContent(opts, callback);
    
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

        it("should return an object representing the request", function () {
            var req = streamClient.getContent(opts, callback);
            expect(req.abort).toEqual(jasmine.any(Function));
        });
    });
});
