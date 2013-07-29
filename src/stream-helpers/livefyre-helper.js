/** 
 * A module to Stream new Content in a Livefyre Collection
 * @module streamhub-sdk/stream-helpers/livefyre-helper
 */
define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/stream-manager',
    'streamhub-sdk/clients/livefyre-bootstrap-client',
    'streamhub-sdk/streams/livefyre-stream',
    'streamhub-sdk/streams/livefyre-reverse-stream'],
function ($, StreamManager, LivefyreBootstrapClient, LivefyreStream, LivefyreReverseStream) {

    /**
     * Get a StreamManager that will later be bound to a Livefyre Collection. No HTTP requests
     * will be made until `.start()` is called.
     * @param opts {Object} Options to configure a Livefyre Stream with.
     * @param opts.network {string} The network name to configure.
     * @param opts.siteId {number} The site id to configure.
     * @param opts.articleId {string} The name of the article to configure.
     * @param opts.environment {?string} The name of the environment (prod/dev/uat/etc) to connect
     *        to. 
     * @throws Error if creating LivefyreStreamManager
     * @returns {StreamManager} A stream manager, configured for use with livefyre's streaming
     *          platform.
     */
    var getLivefyreStreamManager = function (opts) {
        var streamManager = new StreamManager({});

        LivefyreBootstrapClient.getContent(opts, function(err, data) {
            if (err) {
                return callback(err);
            }
            var followers = ((data || {}).headDocument || {}).followers || [];
            var collectionSettings = data.collectionSettings;
            var collectionId = collectionSettings.collectionId;
            var commentId = collectionSettings.event;

            var mainStream = new LivefyreStream($.extend({
                collectionId: collectionId,
                commentId: commentId,
                followers: followers
            }, opts));
            
            var reverseStream = new LivefyreReverseStream($.extend({
                followers: followers,
                initData: data
            }, opts));

            streamManager.set({ 'main': mainStream, 'reverse': reverseStream });
        });
        
        return streamManager;             
    };

    /**
     * @exports streamhub-sdk/stream-helpers/livefyre-helper
     */
    StreamManager.addHelper(function(create) {
        create.livefyreStreams = getLivefyreStreamManager;
    });

    return getLivefyreStreamManager;
});

