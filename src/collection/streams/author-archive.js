'use strict';

var debug = require('streamhub-sdk/debug');
var Auth = require('streamhub-sdk/auth');
var inherits = require('inherits');
var Readable = require('stream/readable');
var BootstrapClient = require('streamhub-sdk/collection/clients/bootstrap-client');
var StateToContent = require('streamhub-sdk/content/state-to-content');

var log = debug('streamhub-sdk/streams/author-archive');

var AuthorArchive = function (opts) {
    opts = opts || {};

    this._authorId = opts.authorId;
    this._network = opts.network;
    this._bootstrapClient = opts.bootstrapClient || new BootstrapClient();

    Readable.call(this, opts);
};
inherits(AuthorArchive, Readable);

AuthorArchive.prototype._read = function () {
    var bootstrapClientOpts = {
        authorId: this._authorId,
        network: this._network
    };

    this._bootstrapClient.getAuthorContent(bootstrapClientOpts, function (err, data) {
        if (err || ! data) {
            this.emit('error', new Error('Error requesting Bootstrap author data for user: '+bootstrapClientOpts.authorId));
            return;
        }

        var contents = this._contentsFromBootstrapDoc(data);

        this.push.apply(this, contents);
    }.bind(this));
};

AuthorArchive.prototype._contentsFromBootstrapDoc = function (bootstrapDoc, opts) {
    opts = opts || {};
    bootstrapDoc = bootstrapDoc || {};

    var contents = [];
    var content;
    var states = bootstrapDoc.data.content || [];
    var state;

    var stateToContent = this._createStateToContent({
        authors: bootstrapDoc.data.authors
    });
    stateToContent.on('data', function (content) {
        contents.push(content);
    });

    for (var i=0, statesCount=states.length; i < statesCount; i++) {
        state = {};
        state.content = states[i];
        state.type = states[i].type || StateToContent.enums.type.indexOf('CONTENT');
        state.source = states[i].source || StateToContent.enums.source.indexOf('livefyre');
        content = stateToContent.write(state);
    }
    stateToContent.write(bootstrapDoc.data);

    log("created contents from bootstrapDoc", contents);
    return contents;
};

AuthorArchive.prototype._createStateToContent = function (opts) {
    opts = opts || {};
    return new StateToContent(opts);
};

module.exports = AuthorArchive;
