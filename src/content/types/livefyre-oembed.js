define([
    'jquery',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/content/types/livefyre-content'],
function($, Oembed, LivefyreContent) {

    /**
     * An Oembed constructed from a StreamHub state of oEmbed type
     * @param json {Object} A state object from StreamHub APIs
     * @param json.content.oembed {Object} An Object conforming to the oEmbed spec
     */
    var LivefyreOembed = function(json) {
        LivefyreContent.call(this, json);
        Oembed.call(this, json.content.oembed);
    };
    LivefyreOembed.prototype = $.extend(new Oembed(), LivefyreContent.prototype);

    return LivefyreOembed;
 });