define([
    'streamhub-sdk/jquery',
    'jasmine',
    'streamhub-sdk/content/types/livefyre-content',
    'jasmine-jquery'],
function ($, jasmine, LivefyreContent) {
    'use strict';

    describe('A LivefyreContent object', function () {
        var mockData = {};
        mockData.livefyreBootstrapContent = {"source": 1, "content": {"replaces": "", "parentId": "", "bodyHtml": "oh hi there", "id": "tweet-308584114829795328@twitter.com", "authorId": "890999516@twitter.com", "updatedAt": 1362407161, "annotations": {}, "createdAt": 1362407161}, "vis": 1, "type": 0, "event": 1362407161286515, "childContent": [], author: {displayName: "sara",tags: [ ],profileUrl: "https://twitter.com/#!/135sara",avatar: "http://a0.twimg.com/profile_images/1349672055/Baqueira_29-01-2010_13-54-52_normal.jpg",type: 3,id: "123568642@twitter.com"}};
        mockData.livefyreStreamContent = {"vis": 1, "content": {"replaces": "", "feedEntry": {"transformer": "lfcore.v2.procurement.feed.transformer.instagram", "feedType": 2, "description": "#gayrights #lgbt #equality #marriageequality <img src=\"http://distilleryimage2.instagram.com/18ea2500970c11e294f522000a9f30b8_7.jpg\" />", "pubDate": 1364409052, "channelId": "http://instagram.com/tags/marriageequality/feed/recent.rss", "link": "http://distilleryimage2.instagram.com/18ea2500970c11e294f522000a9f30b8_7.jpg", "id": "bffcb85a-2976-4396-bb60-3cf5b1e2c3a8", "createdAt": 1364409052}, "bodyHtml": "#gayrights #lgbt #equality #marriageequality ", "annotations": {}, "authorId": "7759cd005d95d8cc5bd93718b2ac0064@instagram.com", "parentId": "", "updatedAt": 1364409052, "id": "bffcb85a-2976-4396-bb60-3cf5b1e2c3a8", "createdAt": 1364409052}, "source": 13, "lastVis": 0, "type": 0, "event": 1364409052662964, author: {displayName: "sara",tags: [ ],profileUrl: "https://twitter.com/#!/135sara",avatar: "http://a0.twimg.com/profile_images/1349672055/Baqueira_29-01-2010_13-54-52_normal.jpg",type: 3,id: "123568642@twitter.com"}};

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
        it("should not allow duplicate replies to be added", function () {
            var spy = jasmine.createSpy();
            content = new LivefyreContent(mockData.livefyreStreamContent);
            content.on('reply', spy);
            content.addReply({id: '12345'});
            content.addReply({id: '12345'});

            expect(spy.callCount).toBe(1);
            expect(content.replies.length).toBe(1);
        });

    });
});
