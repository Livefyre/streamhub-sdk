define([
    'streamhub-sdk/stream',
    'streamhub-sdk/event-emitter',
    'streamhub-sdk/content',
    'streamhub-sdk/view',
    'streamhub-sdk/clients/livefyre-stream-client',
    'streamhub-sdk/clients/livefyre-bootstrap-client',
    'streamhub-sdk/clients/livefyre-write-client',
    'streamhub-sdk/streams/livefyre-stream',
    'streamhub-sdk/streams/livefyre-reverse-stream',
    'streamhub-sdk/views/feed-view',
    'streamhub-sdk/content-types/livefyre-content'
], function(
    Stream,
    EventEmitter,
    Content,
    View,
    LivefyreStreamClient,
    LivefyreBootstrapClient,
    LivefyreWriteClient,
    LivefyreStream,
    LivefyreReverseStream,
    FeedView,
    LivefyreContent
) {
    
    var Hub = {};
    Hub.Stream = Stream;
    Hub.EventEmitter = EventEmitter;
    Hub.Content = Content;
    Hub.View = View;
    
    Hub.Clients = {};
    Hub.Clients.LivefyreStreamClient = LivefyreStreamClient;
    Hub.Clients.LivefyreBootstrapClient = LivefyreBootstrapClient;
    Hub.Clients.LivefyreWriteClient = LivefyreWriteClient;
    
    Hub.Streams = {};
    Hub.Streams.LivefyreStream = LivefyreStream;
    Hub.Streams.LivefyreReverseStream = LivefyreReverseStream;
    
    Hub.Views = {};
    Hub.Views.FeedView = FeedView;
    
    Hub.ContentTypes = {};
    Hub.ContentTypes.LivefyreContent = LivefyreContent;
    
    /**
     * Helper method for easily setting up Livefyre streams
     * @param opts {Object} A set of options used in the creation of the individual streams
     * @return 
     */
    Hub.createLivefyreStreams = function(opts, callback) {
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
            
            callback(null, { main: mainStream, reverse: reverseStream });
            
        });
    
    };
    
    return Hub;
});