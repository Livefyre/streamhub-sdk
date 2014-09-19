define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/content/state-to-content',
    'json!streamhub-sdk-tests/mocks/bootstrap-data.json',
    'stream/readable',
    'streamhub-sdk/storage',
    'inherits'
], function ($, StateToContent, fixture, Readable, Storage, inherits) {
    'use strict';

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
        Readable.call(this, opts);
        opts = opts || {};
        this.fixture = opts.bootstrapFixture || $.extend({}, fixture);
        this.stateToContent = new StateToContent({
            authors: this.fixture.authors,
            storage: new Storage()
        });
        for (var provider in fixture.content) {
            this.stateToContent.write(fixture.content[provider]);
        }
    };

    inherits(MockAttachmentsStream, Readable);


    MockAttachmentsStream.prototype._read = function() {
        this.push(this.stateToContent.read());
    };


    return MockAttachmentsStream;
});
