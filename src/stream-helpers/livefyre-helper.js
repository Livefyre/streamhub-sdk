define([
    'streamhub-sdk/stream-manager',
    'streamhub-sdk/clients/livefyre-bootstrap-client',
    'streamhub-sdk/streams/livefyre-stream',
    'streamhub-sdk/streams/livefyre-reverse-stream'],
function (StreamManager, LivefyreBootstrapClient, LivefyreStream, LivefyreReverseStream) {
    
    /**
     * A set of Streams bound to a Livefyre Collection
     * @exports streamhub-sdk/streams/livefyre-collection-streams
     */
    var createLivefyreStreams = function (opts, callback) {
        var self = this;
        
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

            var streamManager = new StreamManager({ 'main': mainStream, 'reverse': reverseStream });
            callback(null, streamManager);
        });
    };

    StreamManager.addHelper(function(create) {
        create.livefyreStreams = createLivefyreStreams;
    });
});