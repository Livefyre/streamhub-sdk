define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/content/types/livefyre-url-content',
    'json!streamhub-sdk-tests/fixtures/url-type-content.json'],
function ($, LivefyreUrlContent, urlTypeContent) {
    'use strict';

    describe('A LivefyreUrlContent object', function () {
        it('has .viaText is displayName on generator if present', function () {
            var content = new LivefyreUrlContent(urlTypeContent);
            expect(content.viaText).toBe("Nytimes");
        });

        it('has .viaText is id on generator if displayName is not present', function () {
            var modUrl = urlTypeContent;
            modUrl.content.generator.displayName = undefined;

            var content = new LivefyreUrlContent(modUrl);
            
            expect(content.viaText).toBe("www.nytimes.com");
        });

        it('has .viaText is the url on generator if no other option is present', function () {
            var modUrl = urlTypeContent;
            modUrl.content.generator.displayName = undefined;
            modUrl.content.generator.id = undefined;

            var content = new LivefyreUrlContent(modUrl);
            
            expect(content.viaText).toBe("http://www.nytimes.com");
        });
        
        it('has .title if oembed has one', function () {
            var content = new LivefyreUrlContent(urlTypeContent);
            expect(typeof content.title !== "undefined").toBe(true);
        });
    });
});
