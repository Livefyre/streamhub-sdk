var oembedFixtures = require('json!streamhub-sdk-tests/fixtures/oembeds.json');
var LivefyreVideoOembedView = require('streamhub-sdk/content/views/oembed/youtube-video');

describe('LivefyreVideoOembedView', function () {
    it('supports autoplay', function () {
        var view = new LivefyreVideoOembedView({oembed: oembedFixtures.video.livefyre});
        expect(view._autoplaySupported).toBe(true);
    });
});
