define([
    'jquery',
    'jasmine',
    'streamhub-sdk/content/content',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/views/content-view'],
function ($, jasmine, Content, LivefyreContent, ContentView) {
    describe('Default ContentView', function () {
        describe('when constructed', function () {
            var contentView = new ContentView({ content: new Content('blah') });
            it('has a .createdAt Date', function () {
                expect(contentView.createdAt instanceof Date).toBe(true);
            });
        });
        describe('when viewing LivefyreContent', function () {
            var livefyreContent = new LivefyreContent({"vis": 1, "content": {"replaces": "", "feedEntry": {"transformer": "lfcore.v2.procurement.feed.transformer.instagram", "feedType": 2, "description": "#gayrights #lgbt #equality #marriageequality <img src=\"http://distilleryimage2.instagram.com/18ea2500970c11e294f522000a9f30b8_7.jpg\" />", "pubDate": 1364409052, "channelId": "http://instagram.com/tags/marriageequality/feed/recent.rss", "link": "http://distilleryimage2.instagram.com/18ea2500970c11e294f522000a9f30b8_7.jpg", "id": "bffcb85a-2976-4396-bb60-3cf5b1e2c3a8", "createdAt": 1364409052}, "bodyHtml": "#gayrights #lgbt #equality #marriageequality ", "annotations": {}, "authorId": "7759cd005d95d8cc5bd93718b2ac0064@instagram.com", "parentId": "", "updatedAt": 1364409052, "id": "bffcb85a-2976-4396-bb60-3cf5b1e2c3a8", "createdAt": 1364409052}, "source": 13, "lastVis": 0, "type": 0, "event": 1364409052662964, author: {displayName: "sara",tags: [ ],profileUrl: "https://twitter.com/#!/135sara",avatar: "http://a0.twimg.com/profile_images/1349672055/Baqueira_29-01-2010_13-54-52_normal.jpg",type: 3,id: "123568642@twitter.com"}});
            var contentView = new ContentView({ content: livefyreContent });
            contentView.render();
            it('renders .createdAt into a formatted date string', function () {
                expect(typeof contentView.$el.find('.content-created-at').html()).toBe('string');
            });
        });
        describe('when viewing Content with no .createdAt', function () {
            var content = new Content('what'),
                contentView = new ContentView({ content: content });
            contentView.render();
            it('has no .content-created-at', function () {
                expect(contentView.$el.find('.content-created-at').length).toBe(0);
            });
        });
        
    });
});