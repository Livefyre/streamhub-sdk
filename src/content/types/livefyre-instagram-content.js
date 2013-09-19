define([
    'streamhub-sdk/content/types/livefyre-content', 'inherits'],
function(LivefyreContent, inherits) {
    'use strict';

    /**
     * An instagram Content constructed from a StreamHub state of of 'feed' type
     *     that was transformed by lfcore.v2.procurement.feed.transformer.instagram
     * @param json {Object} A state object from StreamHub APIs
     * @exports streamhub-sdk/content/types/livefyre-instagram-content
     * @constructor
     */
    var LivefyreInstagramContent = function(json) {
        LivefyreContent.call(this, json);
    };
    inherits(LivefyreInstagramContent, LivefyreContent);

    return LivefyreInstagramContent;
});
