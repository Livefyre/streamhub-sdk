define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/content/types/livefyre-content'],
function ($, LivefyreContent) {
    'use strict';

    describe('A LivefyreContent object', function () {
        var mockData = {};
        mockData.livefyreBootstrapContent = {"source": 1, "content": {"replaces": "", "parentId": "", "bodyHtml": "oh hi there", "id": "tweet-308584114829795328@twitter.com", "authorId": "890999516@twitter.com", "updatedAt": 1362407161, "annotations": {}, "createdAt": 1362407161}, "vis": 1, "type": 0, "event": 1362407161286515, "childContent": [], author: {displayName: "sara",tags: [ ],profileUrl: "https://twitter.com/#!/135sara",avatar: "http://a0.twimg.com/profile_images/1349672055/Baqueira_29-01-2010_13-54-52_normal.jpg",type: 3,id: "123568642@twitter.com"}};
        mockData.livefyreStreamContent = {"vis": 1, "content": {"replaces": "", "feedEntry": {"transformer": "lfcore.v2.procurement.feed.transformer.instagram", "feedType": 2, "description": "#gayrights #lgbt #equality #marriageequality <img src=\"http://distilleryimage2.instagram.com/18ea2500970c11e294f522000a9f30b8_7.jpg\" />", "pubDate": 1364409052, "channelId": "http://instagram.com/tags/marriageequality/feed/recent.rss", "link": "http://distilleryimage2.instagram.com/18ea2500970c11e294f522000a9f30b8_7.jpg", "id": "bffcb85a-2976-4396-bb60-3cf5b1e2c3a8", "createdAt": 1364409052}, "bodyHtml": "#gayrights #lgbt #equality #marriageequality ", "annotations": {}, "authorId": "7759cd005d95d8cc5bd93718b2ac0064@instagram.com", "parentId": "", "updatedAt": 1364409052, "id": "bffcb85a-2976-4396-bb60-3cf5b1e2c3a8", "createdAt": 1364409052}, "source": 13, "lastVis": 0, "type": 0, "event": 1364409052662964, author: {displayName: "sara",tags: [ ],profileUrl: "https://twitter.com/#!/135sara",avatar: "http://a0.twimg.com/profile_images/1349672055/Baqueira_29-01-2010_13-54-52_normal.jpg",type: 3,id: "123568642@twitter.com"}};
        mockData.featuredBootstrapContent = {
            "content": {
                "parentId": "",
                "bodyHtml": "Enhance your <a href=\"https:\/\/twitter.com\/#!\/search\/realtime\/%23CEM\" class=\"fyre-hashtag\" hashtag=\"CEM\" rel=\"tag\" target=\"_blank\">#CEM<\/a> knowledge at our <a href=\"https:\/\/twitter.com\/#!\/search\/realtime\/%23CX\" class=\"fyre-hashtag\" hashtag=\"CX\" rel=\"tag\" target=\"_blank\">#CX<\/a> cert. course, Nov 5-7 in Chicago. Hotel discounts expire 10\/13, register soon! <a href=\"http:\/\/t.co\/pGZokuptUG\" target=\"_blank\" rel=\"nofollow\">bit.ly\/15fuzkf<\/a>",
                "annotations": {
                    "featuredmessage": {
                        "rel_collectionId": "10739960",
                        "value": 1380848559
                    }
                },
                "authorId": "18463884@twitter.com",
                "updatedAt": 1380831787,
                "id": "tweet-385862600707170304@twitter.com",
                "createdAt": 1380831787
            },
            "vis": 1,
            "source": 1,
            "type": 0,
            "event": 1.3808485590543e+15
        };
        var mock, content;

        describe("when constructed from bootstrap", function () {
            beforeEach(function () {
                mock = mockData.livefyreBootstrapContent;
                content = new LivefyreContent(mock);
            });
            testLivefyreContent();
        });
        describe("when constructed from stream", function () {
            beforeEach(function () {
                mock = mockData.livefyreStreamContent;
                content = new LivefyreContent(mock);
            });
            testLivefyreContent();
        });

        function testLivefyreContent () {
            it("should be instanceof LivefyreContent", function () {
                expect(content instanceof LivefyreContent).toBe(true);
            });
            it("should have a content .body", function () {
                expect(content.body).toBe(mock.content.bodyHtml);
            });
            it("should have .createdAt as a Date object", function () {
                expect(content.createdAt instanceof Date).toBe(true);
            });
            it("should have .updatedAt as a Date object", function () {
                expect(content.updatedAt instanceof Date).toBe(true);
            });
        }

        it("should not allow duplicate attachments to be added", function () {
            var spy = jasmine.createSpy();
            content = new LivefyreContent(mockData.livefyreStreamContent);
            content.on('attachment', spy);
            content.addAttachment({id: '12345'});
            content.addAttachment({id: '12345'});

            expect(spy.callCount).toBe(1);
            expect(content.attachments.length).toBe(1);
        });

        it("has the specified id", function () {
            var content = new LivefyreContent({body: 'body', id: '123456'});
            expect(content.id).toBe('123456');
        });

        it("should not allow duplicate replies to be added", function () {
            var spy = jasmine.createSpy();
            content = new LivefyreContent(mockData.livefyreStreamContent);
            content.on('reply', spy);
            content.addReply({id: '12345'});
            content.addReply({id: '12345'});

            expect(spy.callCount).toBe(1);
            expect(content.replies.length).toBe(1);
        });
        
        it('returns a parent when getParent()', function () {
            var parent = {};
            content = new LivefyreContent(mockData.livefyreStreamContent);
            content._parent = parent;
            
            expect(content.getParent()).toBe(parent);
        });
        
        it('returns null if its parent hasn\'t been provided or undefined if it doesn\'t have a parentId when getParent()', function () {
            content = new LivefyreContent(mockData.livefyreStreamContent);
            expect(content.getParent()).not.toBeDefined();
            content.parentId = '12345';
            expect(content.getParent()).toBeNull();
        });
        
        it('can setParent(), but only when not already set and when IDs are matching', function () {
            var parent = new LivefyreContent(mockData.livefyreStreamContent);
            var reply = new LivefyreContent(mockData.livefyreStreamContent);
            
            reply.setParent(parent);
            expect(reply._parent).not.toBeDefined();
            
            reply.parentId = parent.id;
            reply.setParent(parent);
            expect(reply._parent).toBe(parent);
            
            var other = new LivefyreContent(mockData.livefyreStreamContent);
            other.id = parent.id;
            reply.setParent(other);
            expect(reply._parent).toBe(parent);
        })
        
        it('calls setParent() when addReply()', function () {
            var reply = {
                id: '12345',
                setParent: jasmine.createSpy('setParent')
            };
            content = new LivefyreContent(mockData.livefyreStreamContent);
            
            content.addReply(reply);
            expect(reply.setParent).toHaveBeenCalledWith(content);
        });

        describe('.isFeatured()', function () {
            it('is a method on LivefyreContent', function () {
                expect(content.isFeatured).toEqual(jasmine.any(Function));
            });

            it('returns true if LivefyreContent constructed from featured bootstrap state', function () {
                var featuredContent = new LivefyreContent(mockData.featuredBootstrapContent);
                expect(featuredContent.isFeatured()).toBe(true);
            });

            it('returns false if LivefyreContent constructed from non-featured bootstrap state', function () {
                var nonFeaturedContent = new LivefyreContent(mockData.livefyreBootstrapContent);
                expect(nonFeaturedContent.isFeatured()).toBe(false);
            });
        });

        describe('.getFeaturedValue', function () {
            it('is a method on LivefyreContent', function () {
                expect(content.getFeaturedValue).toEqual(jasmine.any(Function));
            });

            it('returns Number if LivefyreContent constructed from featured bootstrap state', function () {
                var featuredContent = new LivefyreContent(mockData.featuredBootstrapContent);
                expect(featuredContent.getFeaturedValue()).toEqual(jasmine.any(Number));
            });

            it('returns undefined if LivefyreContent constructed from non-featured bootstrap state', function () {
                var nonFeaturedContent = new LivefyreContent(mockData.livefyreBootstrapContent);
                expect(nonFeaturedContent.getFeaturedValue()).toBe(undefined);
            });
        });
    });
});
