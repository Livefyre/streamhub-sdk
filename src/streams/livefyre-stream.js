/** 
 * A module to Stream new Content in a Livefyre Collection
 * @module streamhub-sdk/streams/livefyre-stream
 */
define([
    'jquery',
    'streamhub-sdk/stream',
    'streamhub-sdk/clients/livefyre-stream-client',
    'streamhub-sdk/clients/livefyre-write-client',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-twitter-content',
    'streamhub-sdk/content/types/livefyre-facebook-content',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/storage'
], function(
    $,
    Stream,
    LivefyreStreamClient,
    LivefyreWriteClient,
    LivefyreContent,
    LivefyreTwitterContent,
    LivefyreFacebookContent,
    Oembed,
    Storage
) {

    /**
     * Defines a livefyre stream that is readable and writable from and to a livefyre conversation.
     * @alias module:streamhub-sdk/streams/livefyre-stream
     * @param opts {Object} A set of options to config the stream client with
     * @constructor
     */
    var LivefyreStream = function(opts) {
        Stream.call(this);
        this.opts = opts || {};
        this.network = opts.network;
        this.collectionId = opts.collectionId;
        this.commentId = opts.commentId;
        this.environment = opts.environment;
    };
    $.extend(LivefyreStream.prototype, Stream.prototype);
    
    /**
     * Streams data from the Livefyre stream endpoint until an error occurs.
     * @private
     */
    LivefyreStream.prototype._read = function() {
        var self = this;
        
        var opts = {
            network: this.network,
            collectionId: this.collectionId,
            commentId: this.commentId,
            environment: this.environment
        };
        
        LivefyreStreamClient.getContent(opts, function(err, data) {
            if (!data || err && err != "Timeout") {
                self.emit('error', err);
                self._endRead();
                return;
            } else if (!err) {
                var latestEvent = 0;
                var authors = data.authors;
                
                for (var i in data.states) {
                    var state = data.states[i];
                    if (state.event > latestEvent) {
                        latestEvent = state.event;
                    }
                    
                    if (state.content) {
                        state.author = authors[state.content.authorId];
                        
                        var content;
                        
                        if (state.content.targetId && Storage.get(state.content.targetId)) {
                            parentContent = Storage.get(state.content.targetId);
                            content = LivefyreStream.createContent(state);
                        
                            if (content instanceof Oembed) { // oembed
                                parentContent.addAttachment(content);
                            } else {
                                parentContent.addReply(content);
                            }
                        } else if (state.type === 0) {
                            content = LivefyreStream.createContent(state);
                            self._push(content);
                        }
                        if (content && content.id) {
                            Storage.set(content.id, content);
                        }
                    }
                }
                self.commentId = latestEvent;
            }
            
            // continually read until error
            // also, put it in a setTimeout so that we clear the stack
            setTimeout(function() { self._read(); }, 1);
        });
    };
    
    /**
     * Writes data to the Livefyre stream.
     * @param opts {Object} Options to pass to the LivefyreWriteClient
     * @private
     */
    LivefyreStream.prototype._write = function(opts) {        
        var params = {
            network: this.network,
            collectionId: this.collectionId,
            lftoken: opts.lftoken,
            body: opts.body
        };
        
        LivefyreWriteClient.postContent(params, opts.callback);
    };
    
    LivefyreStream.SOURCES = [
        "livefyre", 
        "twitter",
        "twitter",
        "facebook",
        "livefyre",
        "livefyre",
        "facebook",
        "twitter",
        "livefyre",
        "unknown",
        "unknown",
        "unknown",
        "unknown",
        "feed",
        "facebook"
    ];

    LivefyreStream.createContent = function(state) {
        state.sourceName = LivefyreStream.SOURCES[state.source];
        
        if (state.type === 3) {
            return new Oembed(state);
        } else if (state.sourceName === 'twitter') {
            return new LivefyreTwitterContent(state);
        } else if (state.sourceName === 'facebook') {
            return new LivefyreFacebookContent(state);
        } else {
            return new LivefyreContent(state);
        }
    };

    return LivefyreStream;
});
