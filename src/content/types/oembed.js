define(['streamhub-sdk/jquery', 'streamhub-sdk/content/content', 'streamhub-sdk/util'], function($, Content, util) {

    /**
     * An Oembed Object. As specified by http://oembed.com/
     * @param json {Object} An Oembed-valid Object
     * @exports streamhub-sdk/content/types/oembed
     * @constructor
     */
    var Oembed = function(json) {
        Content.call(this);
        // @todo set a .body property that can be used to embed standard HTML easily

        if (json && Oembed.types.indexOf(json.type) === -1) {
            throw new Error("Oembeds must be constructed with .type in "+Oembed.types);
        }

        json = json || {};

        $.extend(this, json);

        if (typeof this.html !== 'undefined' && $.trim(this.html) === "") {
            this.html = null;
        }
    };
    util.inherits(Oembed, Content);

    Oembed.types = ['photo', 'video', 'link', 'rich'];
    Oembed.properties = ['type', 'version', 'title', 'author_name', 'author_url',
        'provider_name', 'provider_url', 'cache_age', 'thumbnail_url', 'thumbnail_width',
        'thumbnail_height', 'url', 'width', 'height', 'html'];

    /**
     * Get a raw JSON Object that is valid oEmbed v1.0
     * It will not be an instance of Oembed
     */
    Oembed.prototype.toJSON = function () {
        var self = this,
            oembedJson = {};
        $.each(Oembed.properties, function (index, property) {
            if (typeof self[property] !== 'undefined') {
                oembedJson[property] = self[property];
            }
        });
        return oembedJson;
    };

    return Oembed;
 });
