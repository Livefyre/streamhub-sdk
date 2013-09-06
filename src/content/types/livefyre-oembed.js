define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/util'],
function($, Oembed, LivefyreContent, util) {

    /**
     * An Oembed constructed from a StreamHub state of oEmbed type
     * @param json {Object} A state object from StreamHub APIs
     * @param json.content.oembed {Object} An Object conforming to the oEmbed spec
     * @exports streamhub-sdk/content/types/livefyre-oembed
     * @constructor
     */
    var LivefyreOembed = function(json) {
        LivefyreContent.call(this, json);
        Oembed.call(this, json.content.oembed);
        
        if (this.provider_name === "Facebook" && this.url &&
            this.thumbnail_url && (this.html === "" || this.html === null)) {
            this.html = "<a href='"+this.url+"' target='_blank'/><img src='"+this.thumbnail_url+"'/></a>";
        }
    };
    util.inherits(LivefyreOembed, Oembed);
    $.extend(LivefyreOembed.prototype, LivefyreContent.prototype);

    return LivefyreOembed;
 });
