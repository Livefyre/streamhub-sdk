define([
    'streamhub-sdk/content/types/livefyre-url-content',
    'inherits'
], function(LivefyreUrlContent, inherits) {
    'use strict';

    function LivefyreYoutubeContent(json) {
        json.content = Object.create(json.content);
        json.content.generator = {
            displayName: 'YouTube',
            id: 'www.youtube.com',
            image: 'https://www.google.com/s2/favicons?domain=youtube.com',
            url: 'https://www.youtube.com/'
        };
        LivefyreUrlContent.call(this, json);
    }
    inherits(LivefyreYoutubeContent, LivefyreUrlContent);

    return LivefyreYoutubeContent;
});
