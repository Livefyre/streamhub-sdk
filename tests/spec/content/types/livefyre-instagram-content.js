var LivefyreInstagramContent = require('streamhub-sdk/content/types/livefyre-instagram-content');
var instagramCurateState = require('json!streamhub-sdk-tests/fixtures/instagram-curate-state.json');
var mockBootstrapResponse = require('json!streamhub-sdk-tests/mocks/bootstrap-data.json');

'use strict';

describe('A LivefyreInstagramContent object', function () {
    it('uses the state\'s first attachment\'s title if specified, as body', function () {
        var content = new LivefyreInstagramContent(instagramCurateState);
        expect(content.body).toBe(instagramCurateState.content.attachments[0].title);
    });
    it('uses content.body if state has no oembed attachment', function () {
        var instagramRssState = mockBootstrapResponse.content["2 Tiled Attachments"];
        var content = new LivefyreInstagramContent(instagramRssState);
        expect(content.body).toBe(instagramRssState.content.bodyHtml);
    });
});
