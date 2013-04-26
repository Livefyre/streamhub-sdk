define(['jquery', 'streamhub-sdk/content/content'], function($, Content) {

    var LivefyreContent = function(json) {
        Content.call(this);
        if ( ! json) {
            return this;
        }
        this.body = json.content.bodyHtml;
        this.source = LivefyreContent.SOURCES[json.source];
        this.id = json.content.id;
        this.author = json.author;
        this.createdAt = json.content.createdAt;
        this.updatedAt = json.content.updatedAt;
        this.visibility = json.vis;
        this.meta = json;
    };
    $.extend(LivefyreContent.prototype, Content.prototype);

    LivefyreContent.SOURCES = [
        "livefyre", 
        "twitter",
        "twitter",
        "facebook",
        "livefyre",
        "livefyre",
        "facebook",
        "twitter",
        "livefyre",
        "unknown",
        "unknown",
        "unknown",
        "unknown",
        "feed",
        "facebook"
    ];

    return LivefyreContent;
 });