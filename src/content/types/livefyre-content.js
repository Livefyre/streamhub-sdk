define(['jquery', 'streamhub-sdk/content/content'], function($, Content) {

    var LivefyreContent = function(json) {
        Content.call(this);
        this.body = json.content.bodyHtml;
        this.source = LivefyreContent._sources[json.source];
        this.id = json.content.id;
        this.author = json.author;
        this.createdAt = json.content.createdAt;
        this.updatedAt = json.content.updatedAt;
        this.visibility = json.vis;
        this.meta = json;
    };
    $.extend(LivefyreContent.prototype, Content.prototype);

    LivefyreContent.canParse = function(json) {
        return (undefined !== json.source && typeof json.source === "number" &&
            undefined !== json.content && typeof json.content === "object" &&
            undefined !== json.content.replaces && typeof json.content.replaces === "string" &&
            undefined !== json.content.parentId && typeof json.content.parentId === "string" &&
            undefined !== json.content.bodyHtml && typeof json.content.bodyHtml === "string" &&
            undefined !== json.content.id && typeof json.content.id === "string" &&
            undefined !== json.content.updatedAt && typeof json.content.updatedAt === "number" &&
            undefined !== json.content.annotations && typeof json.content.annotations === "object" &&
            undefined !== json.content.createdAt && typeof json.content.createdAt === "number" &&
            undefined !== json.vis && typeof json.vis === "number" &&
            undefined !== json.type && typeof json.type === "number" &&
            undefined !== json.event && typeof json.event === "number" &&
            ((undefined !== json.author && typeof json.author === "object" &&
            undefined !== json.author.displayName && typeof json.author.displayName === "string" &&
            undefined !== json.author.profileUrl && typeof json.author.profileUrl === "string" &&
            undefined !== json.author.avatar && typeof json.author.avatar === "string" &&           
            undefined !== json.author.id && typeof json.author.id === "string") || 
            (undefined !== json.authorId && json.authorId === "-"))
        );
    };
    
    LivefyreContent._sources = [
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
        "feed"
    ];
     
    return LivefyreContent;
 });