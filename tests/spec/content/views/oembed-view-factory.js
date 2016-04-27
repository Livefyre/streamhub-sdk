var EmbedyVideoOembedView = require('streamhub-sdk/content/views/oembed/embedly-video');
var fixtures = require('json!streamhub-sdk-tests/fixtures/oembeds.json');
var LivefyreViewOembedView = require('streamhub-sdk/content/views/oembed/livefyre-video');
var OembedView = require('streamhub-sdk/content/views/oembed-view');
var OembedViewFactory = require('streamhub-sdk/content/views/oembed-view-factory');
var VideoOembedView = require('streamhub-sdk/content/views/oembed/video');
var YoutubeVideoOembedView = require('streamhub-sdk/content/views/oembed/youtube-video');

describe('OembedViewFactory', function () {
    describe('#createOembedView', function () {
        it('creates an instance of OembedView for all non-video types', function () {
            var view = OembedViewFactory.createOembedView({oembed: fixtures.photo.instagram});
            expect(view instanceof OembedView).toBe(true);
        });

        describe('it uses the provider map to create instances of videos', function () {
            it('for default videos', function () {
                var view = OembedViewFactory.createOembedView({oembed: fixtures.video.instagram});
                expect(view instanceof VideoOembedView).toBe(true);
                expect(view._autoplaySupported).toBe(false);
            });

            xit('for embedly', function () {
                var view = OembedViewFactory.createOembedView({oembed: fixtures.video.embedly});
                expect(view instanceof EmbedyVideoOembedView).toBe(true);
                expect(view._autoplaySupported).toBe(false);
            });

            it('for livefyre', function () {
                var view = OembedViewFactory.createOembedView({oembed: fixtures.video.livefyre});
                expect(view instanceof LivefyreViewOembedView).toBe(true);
                expect(view._autoplaySupported).toBe(true);
            });

            it('for youtube', function () {
                var view = OembedViewFactory.createOembedView({oembed: fixtures.video.youtube});
                expect(view instanceof YoutubeVideoOembedView).toBe(true);
                expect(view._autoplaySupported).toBe(true);
            });
        });
    });
});
