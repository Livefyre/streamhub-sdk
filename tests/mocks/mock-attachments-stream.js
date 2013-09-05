define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/stream',
    'streamhub-sdk/content/content',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/streams/livefyre-reverse-stream',
    'json!tests/mocks/bootstrap-data.json',
    'streamhub-sdk/util'
], function ($, Stream, Content, LivefyreContent, LivefyreReverseStream, fixture, util) {

    for (var provider in fixture.content) {
        var state = fixture.content[provider];
        if (!Object.keys(state).length) {
            delete fixture.content[provider];
        }
    }

    /**
     * A MockAttachmentsStream of Content
     */
    var MockAttachmentsStream = function MockAttachmentsStream (opts) {
        opts = opts || {};
        opts.network = 'blah';
        opts.collectionId = 'blah';
        opts.commentId = 'blah';
        opts.environment = 'blah';
        LivefyreReverseStream.call(this, opts);
        this.fixture = opts.bootstrapFixture || $.extend({}, fixture);
    };
    util.inherits(MockAttachmentsStream, LivefyreReverseStream);

    MockAttachmentsStream.prototype._read = function() {
        this._handleBootstrapDocument(this.fixture);
    };

    return MockAttachmentsStream;
});
