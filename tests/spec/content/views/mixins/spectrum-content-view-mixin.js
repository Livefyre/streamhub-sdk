var Content = require('streamhub-sdk/content');
var ContentView = require('streamhub-sdk/content/views/content-view');
var hasSpectrum = require('streamhub-sdk/content/views/mixins/spectrum-content-view-mixin');

describe('SpectrumContentView mixin', function () {
    it('modifies the default class', function () {
        var contentView = new ContentView({content: new Content()});
        hasSpectrum(contentView);
        expect(contentView.elClass).toBe('content spectrum-content');
    });
});
