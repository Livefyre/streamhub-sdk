define([
    'streamhub-sdk/streams',
    'streamhub-sdk/clients/livefyre-bootstrap-client',
    'streamhub-sdk/streams/livefyre-stream',
    'streamhub-sdk/streams/livefyre-reverse-stream'],
function (Streams, LivefyreBootstrapClient, LivefyreStream, LivefyreReverseStream) {
    
    /**
     * A set of Streams bound to a Livefyre Collection
     * @exports streamhub-sdk/streams/livefyre-collection-streams
     */
    var LivefyreCollectionStreams = function (opts) {
        Streams.call(this);
        this._livefyreCollectionOpts = opts;
        this._livefyreStreamsCreated = false;
        this._creatingLivefyreStreams = false;
    };
    LivefyreCollectionStreams.prototype = new Streams();

    /**
     * Start the Streams for the Livefyre Collection
     */
    LivefyreCollectionStreams.prototype.start = function (streamsToStart) {
        var self = this;
        this.ensureStreamsCreated(function (err, streams) {
            Streams.prototype.start.call(self, streamsToStart);
        });
        return this;
    };

    LivefyreCollectionStreams.prototype.ensureStreamsCreated = function (cb) {
        if ( ! this._livefyreStreamsCreated && ! this._creatingLivefyreStreams) {
            this._createLivefyreStreams.apply(this, [this._livefyreCollectionOpts, cb]);
        } else {
            cb.call(this);
        }
    };

    /**
     * Create the LivefyreStream and LivefyreReverseStream for the Livefyre Collection
     */
    LivefyreCollectionStreams.prototype._createLivefyreStreams = function (opts, callback) {
        var self = this;
        self._creatingLivefyreStreams = true;
        LivefyreBootstrapClient.getContent(opts, function(err, data) {
            if (err) {
                return callback(err);
            }

            var pages = data.archiveInfo.pageInfo;
            var pageKeys = Object.keys(pages);
            var lastPageNum = pageKeys[pageKeys.length - 1];
            var collectionId = data.collectionId;
            var commentId = data.event;

            var mainStream = new LivefyreStream($.extend({
                collectionId: collectionId,
                commentId: commentId
            }, opts));
            var reverseStream = new LivefyreReverseStream($.extend({
                page: lastPageNum
            }, opts));

            self.set('main', mainStream);
            self.set('reverse', reverseStream);

            self._livefyreStreamsCreated = true;
            self._creatingLivefyreStreams = false;
            callback.apply(self, [null, { main: mainStream, reverse: reverseStream }]);
        });
    };

    return LivefyreCollectionStreams;
});