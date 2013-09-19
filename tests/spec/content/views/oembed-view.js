define([
    'jquery',
    'jasmine',
    'jasmine-jquery',
    'streamhub-sdk/content/views/oembed-view',
    'hgn!streamhub-sdk/content/templates/oembed-photo',
    'hgn!streamhub-sdk/content/templates/oembed-video',
    'hgn!streamhub-sdk/content/templates/oembed-link',
    'hgn!streamhub-sdk/content/templates/oembed-rich'],
function($, jasmine, jasminejQuery, OembedView, OembedPhotoTemplate, OembedVideoTemplate, OembedLinkTemplate, OembedRichTemplate) {
    'use strict';

    describe('OembedView', function () {
        var oembedAttachment = {
            provider_name: "Twimg",
            provider_url: "http://pbs.twimg.com",
            type: "photo",
            url: "http://pbs.twimg.com/media/BQGNgs9CEAEhmEF.jpg"
        };

        describe('when constructed', function() {

            describe('with options.oembed', function() {
                var oembedView = new OembedView({ oembed: oembedAttachment });

                it('is instance of OembedView', function() {
                    expect(oembedView).toBeDefined();
                    expect(oembedView instanceof OembedView).toBe(true);
                });
            });
        });

        describe('when rendering', function() {

            it('modifies YouTube thumbnail url', function() {
                oembedAttachment.provider_name = 'YouTube';
                oembedAttachment.thumbnail_url = 'http://i.ytimg.com/vi/OOE9l23P7jg/hqdefault.jpg';
                oembedAttachment.type = 'video';
                var oembedView = new OembedView({ oembed: oembedAttachment });
                oembedView.render();

                expect(oembedView.oembed.thumbnail_url).toBe('http://i.ytimg.com/vi/OOE9l23P7jg/mqdefault.jpg');
            });

            it('emits "imageLoaded.hub" event when image loads successfuly', function() {
                var oembedView = new OembedView({ oembed: oembedAttachment });
                var imageLoadedSpy = spyOnEvent(oembedView.$el, 'imageLoaded.hub');
                oembedView.render();
                oembedView.$el.find('img').trigger('load');

                expect(imageLoadedSpy).toHaveBeenTriggered();
            });

            it('emits "imageLoaded.error" event when image does not load', function() {
                var oembedView = new OembedView({ oembed: oembedAttachment });
                var imageErrorSpy = spyOnEvent(oembedView.$el, 'imageError.hub');
                oembedView.render();
                oembedView.$el.find('img').trigger('error');

                expect(imageErrorSpy).toHaveBeenTriggered();
            });

            describe('a oembed photo', function() {
                oembedAttachment.type = 'photo';
                var oembedView = new OembedView({ oembed: oembedAttachment });
                oembedView.render();

                it('uses OembedPhotoTemplate', function() {
                    expect(oembedView.template).toBe(OembedPhotoTemplate);
                });
            });

            describe('a oembed video', function() {
                oembedAttachment.type = 'video';
                var oembedView = new OembedView({ oembed: oembedAttachment });
                oembedView.render();

                it('uses OembedVideoTemplate', function() {
                    expect(oembedView.template).toBe(OembedVideoTemplate);
                });
            });

            describe('a oembed link', function() {
                oembedAttachment.type = 'link';
                var oembedView = new OembedView({ oembed: oembedAttachment });
                oembedView.render();

                it('uses OembedLinkTemplate', function() {
                    expect(oembedView.template).toBe(OembedLinkTemplate);
                });
            });

            describe('a oembed rich', function() {
                oembedAttachment.type = 'rich';
                var oembedView = new OembedView({ oembed: oembedAttachment });
                oembedView.render();

                it('uses OembedRichTemplate', function() {
                    expect(oembedView.template).toBe(OembedRichTemplate);
                });
            });
        });
    });
});
