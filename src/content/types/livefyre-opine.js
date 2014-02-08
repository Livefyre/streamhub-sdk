define([
    'streamhub-sdk/content',
    'inherits'
], function (Content, inherits) {
    var LivefyreOpine = function (json, opts) {
       opts = opts || {};
       Content.call(this, this);

        if (json && json.type !== 1) {
            throw new Error("Opines must be constructed with .type == 1 ");
        }

        json = json || {};

        $.extend(this, json);

        // TODO(ryanc): In v3.0 bootstrap, all opines are Likes,
        // this may change in v3.1 bootstrap
        // (https://github.com/Livefyre/lfpb/blob/master/src/lfpb/facts/content.proto#L227-L258)
        if (opts.opineType == undefined) {
            this.relType = LivefyreOpine.enums.type.indexOf('LIKE');
        }
    };
    inherits(LivefyreOpine, Content);

    LivefyreOpine.enums = {};
    LivefyreOpine.enums.type = [
        'LIKE',
        'FLAG_OFFENSIVE',
        'FLAG_SPAM',
        'FLAG_DISAGREE',
        'FLAG_OFF_TOPIC',
        'FLAG_PROFANE',
        undefined,
        undefined,
        undefined,
        undefined,
        'ANNOTATION',
        'MODERATION_REASON',
        'IS_SPAM_CONTENT',
        'IS_NOT_SPAM_CONTENT'
    ];

    return LivefyreOpine;
});
