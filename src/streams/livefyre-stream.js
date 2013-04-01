define(['jquery',
    'streamhub-sdk/stream',
    'streamhub-sdk/clients/livefyre-stream-client',
    'streamhub-sdk/clients/livefyre-write-client',
    'streamhub-sdk/content/types/livefyre-content'
], function($, Stream, LivefyreStreamClient, LivefyreWriteClient, LivefyreContent) {

    /**
     * Defines a livefyre stream that is readable and writable from and to a livefyre conversation.
     * @param opts {Object} A set of options to config the stream client with
     * @constructor
     */
    var LivefyreStream = function(opts) {
        Stream.call(this);
        this.opts = opts || {};
        this.network = opts.network;
        this.collectionId = opts.collectionId;
        this.commentId = opts.commentId;
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
            commentId: this.commentId
        };
        
        LivefyreStreamClient.getContent(opts, function(err, data) {
            if (err && err != "Timeout") {
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
                    state.author = authors[state.content.authorId];

                    if (state.content && state.content.targetId) {
                        // @todo Implement and use storage class
                        /*if (this.contentCache[content.targetId]) {
                            this.contentCache[content.targetId].update(contentData);
                        }*/
                    } else {
                        var content = new LivefyreContent(state);
                        //self.contentCache[content.id] = content;
                        self._push(content);
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
        var self = this;
        
        var params = {
            network: this.network,
            collectionId: this.collectionId,
            lftoken: opts.lftoken,
            body: opts.body
        };
        
        LivefyreWriteClient.postContent(params);
    };
    return LivefyreStream;
});
