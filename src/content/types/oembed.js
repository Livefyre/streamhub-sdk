define(['jquery', 'streamhub-sdk/content/content'], function($, Content) {

    /**
     * An Oembed Object. As specified by http://oembed.com/
     * @param json {Object} An Oembed-valid Object
     */
    var Oembed = function(json) {
        Content.call(this);
        // @todo set a .body property that can be used to embed standard HTML easily

        if (json && Oembed.types.indexOf(json.type) === -1) {
            throw new Error("Oembeds must be constructed with .type in "+Oembed.types);
        }

        json = json || {};

        $.extend(this, json);

        if (this.html && this.html.trim() === "") {
            this.html = null;
        }
    };
    $.extend(Oembed.prototype, Content.prototype);

    Oembed.types = ['photo', 'video', 'link', 'rich'];

    return Oembed;
 });