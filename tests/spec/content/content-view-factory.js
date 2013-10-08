define([
    'streamhub-sdk/jquery',
    'jasmine',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/content/content-view-factory',
    'streamhub-sdk/content',
    'streamhub-sdk/content/types/oembed'],
function($, jasmine, LivefyreContent, ContentView, ContentViewFactory, Content,
Oembed) {
    'use strict';

    describe('ContentViewFactory', function() {

        describe('when constructed', function() {
            var contentViewFactory;
            beforeEach(function() {
                contentViewFactory = new ContentViewFactory();
            });

            it('takes no arguments', function() {
                expect(contentViewFactory).toBeDefined();
            });

            it('is instance of ContentViewFactory', function() {
                expect(contentViewFactory instanceof ContentViewFactory).toBe(true);
            });
        });

        describe('when creating ContentView instances via .contentRegistry', function() {
            var contentViewFactory = new ContentViewFactory();
            var state = {"vis": 1, "content": {"replaces": "", "feedEntry": {"transformer": "lfcore.v2.procurement.feed.transformer.instagram", "feedType": 2, "description": "#gayrights #lgbt #equality #marriageequality <img src=\"http://distilleryimage2.instagram.com/18ea2500970c11e294f522000a9f30b8_7.jpg\" />", "pubDate": 1364409052, "channelId": "http://instagram.com/tags/marriageequality/feed/recent.rss", "link": "http://distilleryimage2.instagram.com/18ea2500970c11e294f522000a9f30b8_7.jpg", "id": "bffcb85a-2976-4396-bb60-3cf5b1e2c3a8", "createdAt": 1364409052}, "bodyHtml": "#gayrights #lgbt #equality #marriageequality ", "annotations": {}, "authorId": "7759cd005d95d8cc5bd93718b2ac0064@instagram.com", "parentId": "", "updatedAt": 1364409052, "id": "tweet-123@twitter.com", "createdAt": 1364409052}, "source": 13, "lastVis": 0, "type": 0, "event": 1364409052662964, author: {displayName: "sara",tags: [ ],profileUrl: "https://twitter.com/#!/135sara",avatar: "http://a0.twimg.com/profile_images/1349672055/Baqueira_29-01-2010_13-54-52_normal.jpg",type: 3,id: "tweet-123568642@twitter.com"}};
            var contentView;

            for (var i=0; i < ContentViewFactory.prototype.contentRegistry.length; i++) {
                var content = new ContentViewFactory.prototype.contentRegistry[i].type(state);
                contentView = contentViewFactory.createContentView(content);

                it('returns an instance of ContentView', isInstanceOfContentView(contentView));
            }

            function isInstanceOfContentView(contentView) {
                expect(contentView instanceof ContentView).toBe(true);
            }
        });

        describe('when creating content with attachments', function () {
            var contentViewFactory,
                content;
            beforeEach(function () {
                content = new Content('WOAH');
                content.addAttachment(new Oembed({
                    "provider_url": "http://distilleryimage11.ak.instagram.com",
                    "version": "1.0",
                    "title": "",
                    "url": "http://distilleryimage0.ak.instagram.com/0ef8150e2d2311e3957722000a1f9a39_8.jpg",
                    "author_name": "",
                    "height": 612,
                    "width": 612,
                    "html": "",
                    "thumbnail_width": 0,
                    "provider_name": "Instagram",
                    "thumbnail_url": "",
                    "type": "photo",
                    "thumbnail_height": 0,
                    "author_url": ""
                }));
                content.addAttachment(new Oembed({
                    "provider_url": "http://distilleryimage11.ak.instagram.com",
                    "version": "1.0",
                    "title": "",
                    "url": "http://distilleryimage0.ak.instagram.com/0ef8150e2d2311e3957722000a1f9a39_8.jpg",
                    "author_name": "",
                    "height": 612,
                    "width": 612,
                    "html": "",
                    "thumbnail_width": 0,
                    "provider_name": "Instagram",
                    "thumbnail_url": "",
                    "type": "photo",
                    "thumbnail_height": 0,
                    "author_url": ""
                }));
                contentViewFactory = new ContentViewFactory();
            });

            it('after render, has an .attachmentsListView that is a descendant of .el', function () {
                var contentView = contentViewFactory.createContentView(content);
                contentView.render();
                expect(contentView.$el).toContain(contentView.attachmentsView.$el);
            });

            it('.attachmentsListView has oembedViews for each attachment', function () {
                var contentView = contentViewFactory.createContentView(content);
                expect(contentView.attachmentsView.count()).toBe(2);
            });
        });
    });
});
