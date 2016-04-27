var oembedFixtures = require('json!streamhub-sdk-tests/fixtures/oembeds.json');
var YoutubeOembedView = require('streamhub-sdk/content/views/oembed/youtube-video');

describe('YoutubeOembedView', function () {
    it('supports autoplay', function () {
        var view = new YoutubeOembedView({oembed: oembedFixtures.video.youtube});
        expect(view._autoplaySupported).toBe(true);
    });

    xit('removes related urls from the video by adding a query param', function () {
        var view = new YoutubeOembedView({
            oembed: oembedFixtures.video.youtube,
            showVideo: true
        });
        view.render();
        var iframe = view.$el.find('iframe')[0];
        expect(iframe.src.indexOf('%26rel%3D0') > -1).toBe(true);
    });
});
