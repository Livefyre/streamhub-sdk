define(['jquery', 'jasmine', 'jasmine-jquery', 'streamhub-sdk/content/types/oembed'],
function ($, jasmine, jasmineJquery, Oembed) {

	// From "Quick Example" in spec http://oembed.com/
	var mockOembed = {
		"version": "1.0",
		"type": "photo",
		"width": 240,
		"height": 160,
		"title": "ZB8T0193",
		"url": "http://farm4.static.flickr.com/3123/2341623661_7c99f48bbf_m.jpg",
		"author_name": "Bees",
		"author_url": "http://www.flickr.com/photos/bees/",
		"provider_name": "Flickr",
		"provider_url": "http://www.flickr.com/"
	};

	describe("Oembed", function () {
		it("can be constructed", function () {
			var oembed = new Oembed(mockOembed);
			expect(oembed instanceof Oembed).toBe(true);
		});
		it("throws when constructed without a type", function () {
			expect(function () {
				var oembed = new Oembed({});
		    }).toThrow();
		});
		it("throws when constructed without an invalid type", function () {
			expect(function () {
				var oembed = new Oembed({ type: 'none' });
		    }).toThrow();
		});
	});

});