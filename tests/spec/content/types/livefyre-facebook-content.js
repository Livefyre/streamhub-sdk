define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/content/types/livefyre-facebook-content'],
function ($, LivefyreFacebookContent) {
    'use strict';

    describe('A LivefyreFacebookContent object', function () {
        var mockData = {};
        mockData.htmlBootstrapContent = {"source": 1, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>oh hi there, ! ?</p>", "id": "tweet-308584114829795328@twitter.com", "authorId": "890999516@twitter.com", "updatedAt": 1362407161, "annotations": {}, "createdAt": 1362407161}, "vis": 1, "type": 0, "event": 1362407161286515, "childContent": [], author: {displayName: "sara",tags: [ ],profileUrl: "https://twitter.com/#!/135sara",avatar: "http://a0.twimg.com/profile_images/1349672055/Baqueira_29-01-2010_13-54-52_normal.jpg",type: 3,id: "123568642@twitter.com"}};
        mockData.plaintextBootstrapContent = {"source":3,"content":{"parentId":"","bodyHtml":"There is a woman that has went missing in Rome .ga since Sunday night could you please give me a call 706-676-0523","annotations":{},"authorId":"206314573905@facebook.com","updatedAt":1373233626,"id":"fb-post-206314573905_224025057735099","createdAt":1359079307},"vis":1,"type":0,"event":1373233626753545,"childContent":[]};
        mockData.textnodeBootstrapContent = {"vis": 1, "collectionId": "180128560", "content": {"generator": {"id": "facebook.com"}, "parentId": "", "bodyHtml": "<a target=\"_blank\" href=\"https://www.facebook.com/hashtag/BJP\" title=\"#BJP\" class=\"tweet-url hashtag\" rel=\"nofollow\">#BJP</a> <a target=\"_blank\" href=\"https://www.facebook.com/hashtag/NarendraModi\" title=\"#NarendraModi\" class=\"tweet-url hashtag\" rel=\"nofollow\">#NarendraModi</a> eats only costly 5 star grade food, worth thousands every day, our soldier are given jali roti aur namak, patli daal.", "id": "facebook-1376458845732104@facebook.com", "authorId": "100001040046136@facebook.com", "updatedAt": 1484131273, "annotations": {}, "createdAt": 1484131269}, "source": 21, "type": 0, "event": 1484131274343970};

        it('can be constructed with an html .bodyHtml', function () {
            var mock = new LivefyreFacebookContent(mockData.htmlBootstrapContent);
            // check body.toLowerCase because IE8 generates uppercase
            // HTMLElement names
            expect(mock.body.toLowerCase()).toBe(mockData.htmlBootstrapContent.content.bodyHtml.toLowerCase());
        });

        it('can be constructed with non-html .bodyHtml', function () {
            var mock = new LivefyreFacebookContent(mockData.plaintextBootstrapContent);
            expect(mock.body).toBe(mockData.plaintextBootstrapContent.content.bodyHtml);
        });

        it('correctly renders html content that also contains plain text nodes', function () {
            var mock = new LivefyreFacebookContent(mockData.textnodeBootstrapContent);
            expect(mock.body).toBe(mockData.textnodeBootstrapContent.content.bodyHtml);
        });
    });
});
