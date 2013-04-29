define([
    'jquery',
    'jasmine',
    'streamhub-sdk/content/content',
    'streamhub-sdk/content/types/twitter-content',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/content/types/livefyre-oembed',
    'streamhub-sdk/streams/livefyre-stream',
    'streamhub-sdk/clients/livefyre-stream-client',
    'streamhub-sdk/clients/livefyre-write-client',
    'jasmine-jquery'],
function ($, jasmine, Content, TwitterContent, Oembed, LivefyreOembed, LivefyreStream, LivefyreStreamClient,
LivefyreWriteClient) {
    describe('A LivefyreStream', function () {

        var stream, opts, spy;
        var mockData = {"states":{"tweet-312328006913904641@twitter.com":{"vis":1,"content":{"replaces":"","bodyHtml":"<a vocab=\"http://schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:14268796\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https://twitter.com/#!/TheRoyalty\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">TheRoyalty</span></a> hoppin on a green frog after the set at <a vocab=\"http://schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:1240466234\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https://twitter.com/#!/Horseshoe_SX13\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">Horseshoe_SX13</span></a> showcase during <a href=\"https://twitter.com/#!/search/realtime/%23sxsw\" class=\"fyre-hashtag\" hashtag=\"sxsw\" rel=\"tag\" target=\"_blank\">#sxsw</a> <a href=\"http://t.co/lUqA5TT7Uy\" target=\"_blank\" rel=\"nofollow\">pic.twitter.com/lUqA5TT7Uy</a>","annotations":{},"authorId":"190737922@twitter.com","parentId":"","updatedAt":1363299774,"id":"tweet-312328006913904641@twitter.com","createdAt":1363299774},"source":1,"lastVis":0,"type":0,"event":1363299777181024},"oem-3-tweet-312328006913904641@twitter.com":{"vis":1,"content":{"targetId":"tweet-312328006913904641@twitter.com","authorId":"-","link":"http://twitter.com/PlanetLA_Music/status/312328006913904641/photo/1","oembed":{"provider_url":"http://twitter.com","title":"Twitter / PlanetLA_Music: @TheRoyalty hoppin on a green ...","url":"","type":"rich","html":"<blockquote class=\"twitter-tweet\"><a href=\"https://twitter.com/PlanetLA_Music/status/312328006913904641\"></a></blockquote><script async src=\"//platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>","author_name":"","height":0,"thumbnail_width":568,"width":0,"version":"1.0","author_url":"","provider_name":"Twitter","thumbnail_url":"https://pbs.twimg.com/media/BFWcquJCUAA7orG.jpg","thumbnail_height":568},"position":3,"id":"oem-3-tweet-312328006913904641@twitter.com"},"source":1,"lastVis":0,"type":3,"event":1363299777193595}},"authors":{"190737922@twitter.com":{"displayName":"PlanetLA_Music","tags":[],"profileUrl":"https://twitter.com/#!/PlanetLA_Music","avatar":"http://a0.twimg.com/profile_images/1123786999/PLAnew-logo_normal.jpg","type":3,"id":"190737922@twitter.com"}},"jsver":"10026","maxEventId":1363299777193595};
        var finished;
        
        beforeEach(function() {
            finished = false;
            opts = {
                "network": "labs-t402.fyre.co",
                "collectionId": "10669131",
                "commentId": "0"
            };
            spy = spyOn(LivefyreStreamClient, "getContent").andCallFake(function(opts, fn) {
                if (!finished) {
                    finished = true;
                    fn(null, mockData);
                } else {
                    fn("error");
                }
            });
            
            stream = new LivefyreStream(opts);
            stream._push = jasmine.createSpy();
            stream._endRead = jasmine.createSpy();
        });
        
        it ("should getContent() from LivefyreStreamClient when _read() is called", function () {
            stream._read();
    
            waitsFor(function() {
                return stream._endRead.callCount > 0;
            });
            runs(function() {
                expect(spy).toHaveBeenCalled();
                expect(stream._endRead).toHaveBeenCalled();
                expect(stream._endRead.callCount).toBe(1);
                expect(stream._push).toHaveBeenCalled();
                expect(stream._push.callCount).toBe(1);
                expect(stream.commentId).toBe(1363299777193595);
            });
        });
        
        it ("should append author data from getContent() LivefyreStreamClient when _read() is called", function () {
            stream._read();
    
            waitsFor(function() {
                return stream._endRead.callCount > 0;
            });
            runs(function() {
                expect(stream._push.callCount).toBe(1);
                expect(stream._push.calls[0].args[0].author).toBeDefined();
            });
        });

        describe(".write()", function () {
            var mockWriteResponse = {"status": "ok", "code": 200, "data": {"messages": [{"content": {"replaces": null, "bodyHtml": "<p>oh hi there 2</p>", "annotations": {"moderator": true}, "source": 0, "authorId": "system@labs-t402.fyre.co", "parentId": null, "mentions": [], "shareLink": "http://t402.livefyre.com/.fyreit/w9lbch.4", "id": "26394571", "createdAt": 1363808885}, "vis": 1, "type": 0, "event": null, "source": 0}], "authors": {"system@labs-t402.fyre.co": {"displayName": "system", "tags": [], "profileUrl": "", "avatar": "http://gravatar.com/avatar/e23293c6dfc25b86762b045336233add/?s=50&d=http://d10g4z0y9q0fip.cloudfront.net/a/anon/50.jpg", "type": 1, "id": "system@labs-t402.fyre.co"}}}},
                mockWriteTweetResponse = {"status": "ok", "code": 200, "data": {"messages": [{"content": {"replaces": "", "bodyHtml": "MAITRE GIMS : \" Les feat dans SUBLIMINAL ces du tres lourd j'veut pas trop m'avanc\u00e9 mais sa seras du tres lourd \"feat avec EMINEM &amp; 50 CENT?", "annotations": {}, "authorId": "471544268@twitter.com", "parentId": "", "updatedAt": 1366839025, "mentions": [], "shareLink": "http://fyre.it/QE0B9G.4", "id": "tweet-308280235000995842@twitter.com", "createdAt": 1366839025}, "vis": 1, "source": 0, "replies": [], "type": 0, "event": null}], "authors": {"471544268@twitter.com": {"displayName": "twinsley yonkou VX", "tags": [], "profileUrl": "https://twitter.com/#!/TismeyJr", "avatar": "http://a0.twimg.com/profile_images/3339939516/bde222e341d477729170a326ca31204e_normal.jpeg", "type": 3, "id": "471544268@twitter.com"}}}},
                onWriteSpy;
            
            beforeEach(function () {
                spyOn(LivefyreStream.prototype, '_write').andCallThrough();
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
                onWriteSpy = jasmine.createSpy();
            });

            it("throws if not passed an lftoken in opts", function () {
                var content = new Content('Woah!');
                expect(function () {
                    stream.write(content);
                }).toThrow();
                expect(function () {
                    stream.write(content, {});
                }).toThrow();
                expect(function () {
                    stream.write(content, { lftoken: 'token' });
                }).not.toThrow();
            });

            it("can write a String", function () {
                stream.write('unicorns', { lftoken: 'token' }, onWriteSpy);
                expect(stream._write).toHaveBeenCalled();
                expect(LivefyreWriteClient.postContent).toHaveBeenCalled();
                expect(onWriteSpy).toHaveBeenCalled();
            });

            it("can write a Content instance", function () {
                var content = new Content('Woah!');
                stream.write(content, { lftoken: 'token' }, onWriteSpy);
                expect(stream._write).toHaveBeenCalled();
                expect(LivefyreWriteClient.postContent).toHaveBeenCalled();
                expect(onWriteSpy).toHaveBeenCalled();
                expect(onWriteSpy.mostRecentCall.args[0]).toBe(null);
                expect(onWriteSpy.mostRecentCall.args[1]).toBe(content);
            });

            it("can write a Content instance without a callback", function () {
                var content = new Content('Woah!');
                stream.write(content, { lftoken: 'token' });
                expect(stream._write).toHaveBeenCalled();
                expect(LivefyreWriteClient.postContent).toHaveBeenCalled();
                expect(onWriteSpy).not.toHaveBeenCalled();
            });

            it("can write a Content with Oembed attachments", function () {
                var content = new Content('Woah!'),
                    mockOembed = {
                        "version": "1.0",
                        "type": "photo",
                        "width": 240,
                        "height": 160,
                        "title": "ZB8T0193",
                        "url": "http://farm4.static.flickr.com/3123/2341623661_7c99f48bbf_m.jpg",
                        "author_name": "Bees",
                        "author_url": "http://www.flickr.com/photos/bees/",
                        "provider_name": "Flickr",
                        "provider_url": "http://www.flickr.com/"
                    },
                    oembed = new Oembed(mockOembed);
                content.addAttachment(oembed);
                stream.write(content, { lftoken: 'token' }, onWriteSpy);
                expect(stream._write).toHaveBeenCalled();
                expect(LivefyreWriteClient.postContent).toHaveBeenCalled();
                expect(LivefyreWriteClient.postContent.mostRecentCall.args[0].media[0].url).toBe(mockOembed.url);
                expect(onWriteSpy).toHaveBeenCalled();
                expect(onWriteSpy.mostRecentCall.args[0]).toBe(null);
                expect(onWriteSpy.mostRecentCall.args[1]).toBe(content);
            });

            it("can write a Content with LivefyreOembed attachments", function () {
                var content = new Content('Woah!'),
                    mockLivefyreOembedData = {"content": {"targetId": "tweet-327531558825230338@twitter.com", "authorId": "-", "link": "http://twitter.com/ReedEsposito/status/327531558825230338/photo/1", "position": 5, "oembed": {"provider_url": "http://twitter.com", "version": "1.0", "title": "Twitter / ReedEsposito: I love my friends and photoshop ...", "url": "https://pbs.twimg.com/media/BIugN6kCAAAxHDN.gif:large", "author_name": "ReedEsposito", "height": 281, "width": 500, "html": "", "thumbnail_width": 150, "provider_name": "Twitter", "thumbnail_url": "https://pbs.twimg.com/media/BIugN6kCAAAxHDN.gif:thumb", "type": "photo", "thumbnail_height": 150, "author_url": "http://twitter.com/ReedEsposito"}, "id": "oem-5-tweet-327531558825230338@twitter.com"}, "vis": 1, "type": 3, "event": 1366924601375801, "source": 1},
                    oembed = new LivefyreOembed(mockLivefyreOembedData);
                content.addAttachment(oembed);
                stream.write(content, { lftoken: 'token' }, onWriteSpy);
                expect(stream._write).toHaveBeenCalled();
                expect(LivefyreWriteClient.postContent).toHaveBeenCalled();
                expect(LivefyreWriteClient.postContent.mostRecentCall.args[0].media[0].url).toBe(mockLivefyreOembedData.content.oembed.url);
                expect(onWriteSpy).toHaveBeenCalled();
                expect(onWriteSpy.mostRecentCall.args[0]).toBe(null);
                expect(onWriteSpy.mostRecentCall.args[1]).toBe(content);
            });

            it("can write a TwitterContent instance", function () {
                var twitterContent = new TwitterContent({
                        body: 'New Monster Headphones CES 2012: Check out Today\'s best deals on gadgets HERE - amzn.to SUBSCRIBE FOR MORE CES... <a href="http://t.co/KRrJEnchKM" target="_blank" rel="nofollow">bit.ly/YZcYO9</a>',
                        tweetId: '308386119479861248'
                    }),
                    onWriteSpy = jasmine.createSpy();
                stream.write(twitterContent, { lftoken: 'token' }, onWriteSpy);
                expect(stream._write).toHaveBeenCalled();
                expect(LivefyreWriteClient.postContent).not.toHaveBeenCalled();
                expect(LivefyreWriteClient.postTweet).toHaveBeenCalled();
                expect(onWriteSpy).toHaveBeenCalled();
                expect(onWriteSpy.mostRecentCall.args[0]).toBe(null);
                // The callback gets a fully hydrated version of the same content instance
                expect(onWriteSpy.mostRecentCall.args[1]).toBe(twitterContent);
                expect(onWriteSpy.mostRecentCall.args[1].id).toBeDefined();
            });
        });
    }); 
});
