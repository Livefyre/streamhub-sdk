define([
    'streamhub-sdk/content/types/livefyre-content', 'streamhub-sdk/util'],
function(LivefyreContent, util) {

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
    util.inherits(LivefyreInstagramContent, LivefyreContent);

    return LivefyreInstagramContent;
 });
