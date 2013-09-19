define([
	'streamhub-sdk/jquery',
	'jasmine',
	'jasmine-jquery',
	'streamhub-sdk/content/types/oembed',
	'streamhub-sdk/content/types/livefyre-oembed',
	'streamhub-sdk/content/types/livefyre-content'],
function ($, jasmine, jasminejquery, Oembed, LivefyreOembed, LivefyreContent) {
	'use strict';

	var mockLivefyreOembedData = {"content": {"targetId": "tweet-327531558825230338@twitter.com", "authorId": "-", "link": "http://twitter.com/ReedEsposito/status/327531558825230338/photo/1", "position": 5, "oembed": {"provider_url": "http://twitter.com", "version": "1.0", "title": "Twitter / ReedEsposito: I love my friends and photoshop ...", "url": "https://pbs.twimg.com/media/BIugN6kCAAAxHDN.gif:large", "author_name": "ReedEsposito", "height": 281, "width": 500, "html": "", "thumbnail_width": 150, "provider_name": "Twitter", "thumbnail_url": "https://pbs.twimg.com/media/BIugN6kCAAAxHDN.gif:thumb", "type": "photo", "thumbnail_height": 150, "author_url": "http://twitter.com/ReedEsposito"}, "id": "oem-5-tweet-327531558825230338@twitter.com"}, "vis": 1, "type": 3, "event": 1366924601375801, "source": 1};

	describe("LivefyreOembed", function () {
		var lfOembed;

		beforeEach(function () {
			lfOembed = new LivefyreOembed(mockLivefyreOembedData);
		});

		it("can be constructed", function () {
			expect(lfOembed instanceof LivefyreOembed).toBe(true);
			expect(lfOembed instanceof Oembed).toBe(true);
		});

		it(".source is defined and in LivefyreContent.SOURCES", function () {
			expect(lfOembed.source).toBeDefined();
			expect(LivefyreContent.SOURCES.indexOf(lfOembed.source)).toBeGreaterThan(-1);
		});
	});
});
