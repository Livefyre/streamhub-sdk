define(['jquery',
    'streamhub-sdk/event-emitter'
], function($, EventEmitter) {

    var Content = function(body) {
        EventEmitter.call(this);
        this.body = body;
        this.attachments = [];
        this.replies = [];
    };
    $.extend(Content.prototype, EventEmitter.prototype);

    Content.prototype.addAttachment = function(obj) {
        this.attachments.push(obj);
        this.emit('addAttachment', obj);
    };

    Content.prototype.addReply = function(obj) {
        this.replies.push(obj);
        this.emit('addReply', obj);
    };

    return Content;
 });