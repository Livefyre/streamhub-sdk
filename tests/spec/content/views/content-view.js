define([
    'jquery',
    'streamhub-sdk/util',
    'streamhub-sdk/content',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-twitter-content',
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/content/content-view-factory',
    'streamhub-sdk/content/views/tiled-attachment-list-view'],
function (
    $,
    util,
    Content,
    LivefyreContent,
    LivefyreTwitterContent,
    ContentView,
    ContentViewFactory,
    TiledAttachmentListView) {
    'use strict';

    describe('Default ContentView', function () {

        describe('when constructed', function () {
            var contentView = new ContentView({ content: new Content('blah') });
            it('has a .createdAt Date', function () {
                expect(contentView.createdAt instanceof Date).toBe(true);
            });
        });
        
        describe('.remove', function () {
            var content,
                contentView,
                countListeners = function ($el) {
                //obj.on('', $el) and not $el.on('', obj); 
                    var obj = $._data($el, 'events');
                    var ownPropertyNames = [];
                    if ( ! obj) {
                        return 0;
                    }
                    for (var name in obj) {
                        if (obj.hasOwnProperty(name)) {
                            ownPropertyNames.push(name);
                        }
                    }
                    return ownPropertyNames.length;
                };
            beforeEach(function () {
                content = new Content('Body Text', 'id');
                contentView = new ContentView({'content': content});
                contentView.render();
            });
            
            it('can remove its elements from the dom', function () {
                var $obj = contentView.$el,
                    elem = $obj[0],
                    doc = document.documentElement;//sandbox(); ?
                $obj.prependTo(doc);
                expect($.contains(doc, elem)).toBe(true);
                contentView.remove();
                
                expect($.contains(doc, elem)).toBe(false);
            });
            
            it('retains its listeners', function () {
                var listenersCount = countListeners(contentView.$el[0]);
                expect(countListeners(contentView.$el[0])).toBeGreaterThan(0);

                contentView.remove();

                expect(countListeners(contentView.$el[0])).toBe(listenersCount);
            });
            
            it('is called when its content visibility changes to "NONE"', function () {
                spyOn(contentView, 'remove').andCallThrough();
                
                content.set({visibility: 'NONE'});

                expect(contentView.remove).toHaveBeenCalled();
            });
            
            it('emits \'removeContentView.hub\'', function () {
                var spy = jasmine.createSpy('removed handler');
                
                contentView.$el.on('removeContentView.hub', spy);
                
                contentView.remove();
                
                expect(spy).toHaveBeenCalled();
                expect(spy.calls[0].args[1]).toEqual({ contentView: contentView });
            });
        });

        describe('when viewing LivefyreContent', function () {
            var livefyreContent,
                contentView;

            beforeEach(function () {
                livefyreContent = new LivefyreContent({"vis": 1, "content": {"replaces": "", "feedEntry": {"transformer": "lfcore.v2.procurement.feed.transformer.instagram", "feedType": 2, "description": "#gayrights #lgbt #equality #marriageequality <img src=\"http://distilleryimage2.instagram.com/18ea2500970c11e294f522000a9f30b8_7.jpg\" />", "pubDate": 1364409052, "channelId": "http://instagram.com/tags/marriageequality/feed/recent.rss", "link": "http://distilleryimage2.instagram.com/18ea2500970c11e294f522000a9f30b8_7.jpg", "id": "bffcb85a-2976-4396-bb60-3cf5b1e2c3a8", "createdAt": 1364409052}, "bodyHtml": "#gayrights #lgbt #equality #marriageequality ", "annotations": {}, "authorId": "7759cd005d95d8cc5bd93718b2ac0064@instagram.com", "parentId": "", "updatedAt": 1364409052, "id": "bffcb85a-2976-4396-bb60-3cf5b1e2c3a8", "createdAt": 1364409052}, "source": 13, "lastVis": 0, "type": 0, "event": 1364409052662964, author: {displayName: "sara",tags: [ ],profileUrl: "https://twitter.com/#!/135sara",avatar: "http://a0.twimg.com/profile_images/1349672055/Baqueira_29-01-2010_13-54-52_normal.jpg",type: 3,id: "123568642@twitter.com"}});
                contentView = new ContentView({ content: livefyreContent });
                spyOn(contentView, 'formatDate').andCallThrough();
                contentView.render();
            });
            it('renders .createdAt into a formatted date string', function () {
                expect(contentView.formatDate).toHaveBeenCalled();
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
        
        describe('when rendering avatars', function () {
            it('removes the avatar section if the avatar image fails to load', function () {
                var content = new Content('<p>My avatar is broken</p>');
                content.set({
                    author: {
                        displayName: 'ben',
                        avatar: 'a broken avatar url'
                    }
                });
                var contentView = new ContentView({
                    content: content
                });
                var _handleAvatarError = spyOn(contentView, '_handleAvatarError').andCallThrough();
                contentView.render();
                waitsFor(function () {
                    return _handleAvatarError.callCount;
                });
                runs(function () {
                    expect(contentView.$(contentView.avatarSelector)).not.toExist();
                });
            });
        });

        describe('when Content is featured-content', function () {
            var content,
                view;
            beforeEach(function () {
                content = new LivefyreContent({"content": {
                    "parentId": "",
                    "bodyHtml": "Thanks for the follow! <a vocab=\"http:\/\/schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:580410539\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https:\/\/twitter.com\/#!\/DLT617\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">DLT617<\/span><\/a> <a vocab=\"http:\/\/schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:195633537\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https:\/\/twitter.com\/#!\/Mallyarashmi\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">Mallyarashmi<\/span><\/a> <a vocab=\"http:\/\/schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:14673143\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https:\/\/twitter.com\/#!\/pdeverak\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">pdeverak<\/span><\/a> <a vocab=\"http:\/\/schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:109383777\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https:\/\/twitter.com\/#!\/aisconsulting\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">aisconsulting<\/span><\/a> <a vocab=\"http:\/\/schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:472276147\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https:\/\/twitter.com\/#!\/401BayCentre\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">401BayCentre<\/span><\/a> <a vocab=\"http:\/\/schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:45034162\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https:\/\/twitter.com\/#!\/AveusLLC\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">AveusLLC<\/span><\/a> <a vocab=\"http:\/\/schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:1934860693\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https:\/\/twitter.com\/#!\/NeilNeillewis\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">NeilNeillewis<\/span><\/a> <a vocab=\"http:\/\/schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:21430851\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https:\/\/twitter.com\/#!\/huertaja\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">huertaja<\/span><\/a> <a vocab=\"http:\/\/schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:15837653\" data-lf-handle=\"\" data-lf-provider=\"twitter\" property=\"url\" href=\"https:\/\/twitter.com\/#!\/cboudreaux\" target=\"_blank\" class=\"fyre-mention fyre-mention-twitter\">@<span property=\"name\">cboudreaux<\/span><\/a>",
                    "annotations": {
                      "featuredmessage": {
                        "rel_collectionId": "10739960",
                        "value": 1381771898
                      }
                    },
                    "authorId": "18463884@twitter.com",
                    "updatedAt": 1381338371,
                    "id": "tweet-387987364657643520@twitter.com",
                    "createdAt": 1381338371
                  },
                  "vis": 1,
                  "type": 0,
                  "event": 1.3817718982409e+15,
                  "source": 1
                });
                view = new ContentView({ content: content });
            });
            it('renders with the content-featured class in its view', function () {
                var $el = view.render().$el.find('.content-featured');

                expect($el.length).toBe(1);
            });
        });

        describe('when Content has no image attachment(s)', function() {
            var content = new Content('what'),
                contentView = new ContentView({ content: content });
            contentView.render();
            it('does not have .content-with-image', function() {
                expect(contentView.el).not.toHaveClass('content-with-image');
            });
        });

        describe('when Content has image attachment', function() {
            describe('when image attachment loads', function() {
                var attachment = {
                        provider_name: "Twimg",
                        provider_url: "http://pbs.twimg.com",
                        type: "photo",
                        url: "http://pbs.twimg.com/media/BQGNgs9CEAEhmEF.jpg"
                    },
                    content = new Content({ body: 'what' }),
                    attachmentListView = new TiledAttachmentListView({ content: content }),
                    contentView = new ContentView({ content: content, attachmentsView: attachmentListView });

                contentView.render();
                content.addAttachment(attachment);

                it('has .content-with-image', function() {
                    waitsFor(function() {
                        return contentView.$el.hasClass('content-with-image');
                    });
                    runs(function() {
                        expect(contentView.el).toHaveClass('content-with-image');
                    });
                });
            });

            describe('when image attachment does not load', function() {
                var attachment = {
                        provider_name: "bad provider",
                        provider_url: "http://badbadprovider.com",
                        type: "photo",
                        url: "a broken url"
                    },
                    content,
                    attachmentListView,
                    contentView,
                    imageError;

                beforeEach(function() {
                    content = new Content({ body: 'what' });
                    attachmentListView = new TiledAttachmentListView({ content: content });
                    contentView = new ContentView({ content: content, attachmentsView: attachmentListView });
                    imageError = false;
                    contentView.$el.on('imageError.hub', function() {
                        imageError = true;
                    });

                    contentView.render();
                    content.addAttachment(attachment);
                });

                it('does not have .content-with-image', function() {
                    waitsFor(function() {
                        return imageError;
                    });
                    runs(function() {
                        expect(contentView.el).not.toHaveClass('content-with-image');
                    });
                });
                it('has no .content-attachment descendants', function() {
                    waitsFor(function() {
                        return imageError;
                    });
                    runs(function() {
                        expect(contentView.$el.find('.content-attachment')).toHaveLength(0);
                    });
                });
            });
        });

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
                    content = new Content({ body: 'what' });
                    contentView = new ContentView({ content: content });
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

                it("sets #_likeRequestListener flag to true", function () {
                    expect(contentView._likeRequestListener).toBe(false);
                    likeButtonEl.trigger('click');
                    expect(contentView._likeRequestListener).toBe(true);
                });
            });

            //describe("body element 'contentLike.hub' listener", function () {

            //});
        });

    });
});
