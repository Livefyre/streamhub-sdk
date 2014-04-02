define([
    'streamhub-sdk/jquery',
    'event-emitter',
    'inherits'
], function($, EventEmitter, inherits, Enums) {
    'use strict';

    /**
     * A piece of Web Content
     * @param body {!string|{body: string}} A string of HTML, the Content body.
     *     If an object, it should have a .body property
     * @fires Content#attachment
     * @fires Content#removeAttachment
     * @exports streamhub-sdk/content
     * @constructor
     */
    var Content = function(bodyOrObj) {
        var body = bodyOrObj;
        var obj = {};
        EventEmitter.call(this);
        if (typeof bodyOrObj === 'object') {
            body = body.body;
            obj = bodyOrObj;
        }
        this.body = body;
        var vis = (typeof obj.visibility === 'number') ? obj.visibility :
            (typeof obj.vis === 'number') ? obj.vis : 1;
        this.visibility = Content.enums.visibility[vis];
        this.attachments = obj.attachments || [];
        this.replies = obj.replies || [];
        this.opines = obj.opines || [];
    };
    inherits(Content, EventEmitter);

    /**
     * Attach an Oembed to the Content
     * @param obj {Oembed} An Oembed Content instance to attach
     * @fires Content#attachment
     */
    Content.prototype.addAttachment = function(obj) {
        this.attachments.push(obj);
        this.emit('attachment', obj);
    };

    /**
     * Remove an Oembed from the Content
     * @param obj {Oembed} An Oembed Content instance to attach
     * @fires Content#removeAttachment
     */
    Content.prototype.removeAttachment = function(obj) {
        this.attachments.splice(this.attachments.indexOf(obj), 1);
        this.emit('removeAttachment', obj);
    };

    /**
     * Add a reply to the Content
     * @param obj {Content} A piece of Content in reply to this one
     * @fires Content#addReply
     */
    Content.prototype.addReply = function(obj) {
        this.replies.push(obj);
        this.emit('reply', obj);
    };

    /**
     * Set some properties and emit 'change' and 'change:{property}' events
     * @param newProperties {Object} An object of properties to set on this Content
     * @param silence [boolean] Mute any events that would be fired
     * @fires Content#change
     * @fires Content#event:change:_property_
     */
    Content.prototype.set = function (newProperties, silence) {
        newProperties = newProperties || {};
        var oldProperties = {};
        var oldVal, newVal, changed;
        for (var key in newProperties) {
            if (newProperties.hasOwnProperty(key) && key.charAt(0) !== '_') {//ignore _listeners and others
                oldVal = oldProperties[key] = this[key];
                newVal = this[key] = newProperties[key];
                if (newVal !== oldVal || typeof newVal === 'object') {
                    silence || this.emit('change:'+key, newVal, oldVal);//Will emit 'change:visibility'
                    changed = true;
                }
            }
        }
        if (changed) {
            silence || this.emit('change', newProperties, oldProperties);
        }
    };

    Content.enums = {};
    /**
     * The StreamHub APIs use enumerations to define
     * the visibility of messages sent down the wire. All levels of
     * visibility should be in this enumeration.
     * @enum visibility
     * @property {string} visibility.NONE - Should not be displayed.
     * @property {string} visibility.EVERYONE - Visible to all.
     * @property {string} visibility.OWNER - Visible only to the author.
     * @property {string} visibility.GROUP - Visible to privileged users.
     */
    Content.enums.visibility = [
        'NONE',
        'EVERYONE',
        'OWNER',
        'GROUP'
    ];

    return Content;
});
