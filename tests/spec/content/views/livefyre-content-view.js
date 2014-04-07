define([
    'jquery',
    'streamhub-sdk/util',
    'streamhub-sdk/content',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-twitter-content',
    'streamhub-sdk/content/views/livefyre-content-view',
    'streamhub-sdk/content/content-view-factory',
    'streamhub-sdk/content/views/tiled-attachment-list-view'],
function (
    $,
    util,
    Content,
    LivefyreContent,
    LivefyreTwitterContent,
    LivefyreContentView,
    ContentViewFactory,
    TiledAttachmentListView) {
    'use strict';

    describe('LivefyreContentView', function () {

        describe('Like button', function () {

            it("only renders for non-Twitter content items", function () {
                var contentViewFactory = new ContentViewFactory();

                var twitterContent = new LivefyreTwitterContent({
                    id: 'tweet-1234@twitter.com',
                    body: 'tweet i am',
                    author: {
                        id: 'jimmy@twitter.com'
                    }
                });
                var twitterContentView = contentViewFactory.createContentView(twitterContent);
                twitterContentView.render();

                expect(twitterContentView.$el.find('.hub-content-like')).toHaveLength(0);

                var lfContent = new LivefyreContent({ body: 'lf content' });
                var lfContentView = contentViewFactory.createContentView(lfContent);
                lfContentView.render();

                expect(lfContentView.$el.find('.hub-content-like')).toHaveLength(1);
            });

            describe('when Like button clicked', function () {
                var content,
                    contentView,
                    likeButtonEl;

                beforeEach(function () {
                    content = new LivefyreContent({ body: 'what' });
                    contentView = new LivefyreContentView({ content: content });
                    contentView.render();
                    likeButtonEl = contentView.$el.find('.hub-content-like');
                });

                afterEach(function () {
                    $('body').off();
                });

                it("lazily attaches an event listener for 'contentLike.hub' event on body element", function () {
                    expect($._data($('body')[0], 'events')).toBe(undefined);
                    likeButtonEl.trigger('click');
                    expect($._data($('body')[0], 'events').contentLike.length).toBe(1);
                });
            });

            describe("body element 'contentLike.hub' listener", function () {
                var content,
                    contentView,
                    likeButtonEl;

                beforeEach(function () {
                    content = new Content({ body: 'what' });
                    contentView = new LivefyreContentView({ content: content });
                    contentView.render();
                    likeButtonEl = contentView.$el.find('.hub-content-like');
                });

                afterEach(function () {
                    $('body').off();
                });
            });
        });

    });
});
