define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/content',
    'streamhub-sdk/content/annotator',
    'streamhub-sdk/content/types/livefyre-opine',
    'inherits'],
function($, Content, Annotator, LivefyreOpine, inherits) {
    'use strict';

    /**
     * Base class for any piece of Livefyre content. Extracts the details of the content
     * from the json object passed in via the Livefyre stream.
     * @param json {!Object} An object obtained via a Livefyre stream that represents the
     *        state of the content.
     * @param json.body {!string}
     * @param json.id {!number}
     * @param opts {object}
     * @param opts.annotator {Annotator}
     * @exports streamhub-sdk/content/types/livefyre-content
     * @constructor
     */
    var LivefyreContent = function(json, opts) {
        opts = opts || {};
        Content.call(this);

        this._annotator = opts.annotator || this._createAnnotator();

        this.likedBy = [];

        // Set state from Livefyre API JSON if provided
        if (json) {
            json.content = json.content || {};
            json.content.annotations = json.content.annotations || {};

            this.set({ id: json.content.id || json.id });
            this.author = json.author;
            this.title = json.content.title;
            this.feedUrl = (json.content.feedEntry || {}).link;
            this.createdAt = new Date(1000 * json.content.createdAt);
            this.updatedAt = new Date(1000 * json.content.updatedAt);
            this.lastVisibility = Content.enums.visibility[json.lastVis];
            this.visibility = Content.enums.visibility[json.vis];
            this.set({ parentId: json.content.parentId });
            this.meta = json;
            this._annotator.annotate(this, {
                added: json.content.annotations
            }, true);  // Silently add b/c this is new Content.

            // Add v3.1-style attachments
            if (json.content.attachments) {
                json.content.attachments.map(this.addAttachment.bind(this));
            }
        }

        this.body = json ? json.content.bodyHtml : '';
        this.source = json ? LivefyreContent.SOURCES[json.source] : 'livefyre';
    };
    inherits(LivefyreContent, Content);

    LivefyreContent.prototype.typeUrn = 'urn:livefyre:js:streamhub-sdk:content:types:livefyre';

    /**
     * Overridable annotator instantiator
     */
    LivefyreContent.prototype._createAnnotator = function() {
        return new Annotator();
    };

    /**
     * Attach an Oembed to the Content while first checking for an existing attachment.
     * @param obj {Oembed} An Oembed Content instance to attach
     * @fires Content#attachment
     */
    LivefyreContent.prototype.addAttachment = function(obj) {
        var found = false;
        if (obj.id) {
            for (var i in this.attachments) {
                if (this.attachments[i].id === obj.id) {
                    found = true;
                }
            }
        }
        if (!found) {
            this.attachments.push(obj);
            this.emit('attachment', obj);
        }
    };

    /**
     * Add a reply to the Content while first checking for an existing reply.
     * @param obj {Content} A piece of Content in reply to this one
     * @fires Content#reply
     */
    LivefyreContent.prototype.addReply = function(obj) {
        var found = false;
        if (obj.id) {
            for (var i in this.replies) {
                if (this.replies[i].id === obj.id) {
                    found = true;
                }
            }
        }
        if (!found) {
            obj.setParent && obj.setParent(this);
            this.replies.push(obj);
            this.emit('reply', obj);
        }
    };

    /**
     * Add a opine to the Content while first checking for an existing opine.
     * @param obj {Content} A piece of Content in reply to this one
     * @fires Content#opine
     */
    LivefyreContent.prototype.addOpine = function(obj) {
        if (obj.vis === 0) {
            this.removeOpine(obj);
            return;
        }

        var found = false;
        if (obj.id) {
            for (var i=0; i < this.opines.length; i++) {
                if (this.opines[i].id === obj.id) {
                    found = true;
                }
            }
        } else {
            for (var i=0; i < this.opines.length; i++) {
                if (this.opines[i].content.id === obj.content.id) {
                    found = true;
                }
            }
        }

        if (!found) {
            this.opines.push(obj);
            this.emit('opine', obj);
        }
    };

    /**
     * Remove an Opine from the LivefyreContent
     * @param obj {Oembed} An LivefyreOpine instance to remove
     * @fires Content#removeOpine
     */
    LivefyreContent.prototype.removeOpine = function(obj) {
        var indexToRemove = null;
        if (obj.id) {
            for (var i=0; i < this.opines.length; i++) {
                if (this.opines[i].id === obj.id) {
                    indexToRemove = i;
                    break;
                }
            }
        } else {
            for (var i=0; i < this.opines.length; i++) {
                if (this.opines[i].content.id === obj.content.id) {
                    indexToRemove = i;
                    break;
                }
            }
        }
        if (indexToRemove === null) {
            return;
        }
        this.opines.splice(indexToRemove, 1);
        this.emit('removeOpine', obj);
    };

    /**
     * Sets a reference to the provided Content as its parent Content.
     * Can only be set once and if the id matches.
     * @param parent {!Content}
     */
    LivefyreContent.prototype.setParent = function (parent) {
        if (this._parent || !parent) {
            //Can only set once and can't set to falsy value
            return
        }
        if (this.parentId && parent.id === this.parentId) {
            //If parent is valid, set it
            this._parent = parent;
        }
    };

    /**
     * Returns a reference to this._parent if it exists, null if it doesn't, and
     * undefined if this object doesn't even have a parentId.
     * @returns {?Content=}
     */
    LivefyreContent.prototype.getParent = function (parent) {
        if (this._parent) {
            return this._parent;
        }
        return (this.parentId) ? null : undefined;
    };

    /**
     * Return the number of likes for this Content
     * @return {Number} The number of likes
     */
    LivefyreContent.prototype.getLikeCount = function () {
        return this._getLegacyLikeCount() || this.likedBy.length || 0;
    };

    /**
     * Return the number of likes for this Content, checking the legacy opines
     * @return {Number} The number of likes (determined from opines)
     */
    LivefyreContent.prototype._getLegacyLikeCount = function () {
        var likes = 0;
        for (var i=0; i < this.opines.length; i++) {
            if (this.opines[i].author && this.opines[i].author.id) {
                likes++;
            }
        }
        return likes;
    };

    /**
     * Return whether this Content is liked for a given author id
     * @return {boolean}
     */
    LivefyreContent.prototype.isLiked = function (authorId) {
        for (var i=0; i < this.opines.length; i++) {
            if (authorId === this.opines[i].author.id) {
                return true;
            }
        }

        for (var i=0; i < this.likedBy.length; i++) {
            if (authorId === this.likedBy[i]) {
                return true;
            }
        }

        return false;
    };

    /**
     * Return whether this Content is featured in a StreamHub Collection
     * @return {boolean}
     */
    LivefyreContent.prototype.isFeatured = function () {
        return Boolean(this.featured);
    };

    /**
     * Return the featured value for this Content, if it is featured
     * @return {Number|undefined} The featured value, if featured, else undefined
     */
    LivefyreContent.prototype.getFeaturedValue = function () {
        if (!this.isFeatured()) {
            return undefined;
        }
        return this.featured.value;
    };

    /**
     * The set of sources as defined by Livefyre's Stream API
     */
    LivefyreContent.SOURCES = [
        "livefyre",    // 0
        "twitter",     // 1
        "twitter",     // 2
        "facebook",    // 3
        "livefyre",    // 4
        "livefyre",    // 5
        "facebook",    // 6
        "twitter",     // 7
        "livefyre",    // 8
        "unknown",
        "unknown",
        "unknown",
        "unknown",
        "feed",        // 13
        "facebook",    // 14
        "unknown",
        "unknown",
        "unknown",
        "unknown",
        "instagram",   // 19
        "twitter",     // 20
        "facebook",     // 21
        "url",     // 22
        "facebook" // 23 - Facebook public feed
    ];

    return LivefyreContent;
});
