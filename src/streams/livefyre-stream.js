define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/stream',
    'streamhub-sdk/clients/livefyre-stream-client',
    'streamhub-sdk/clients/livefyre-write-client',
    'streamhub-sdk/content/content',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-twitter-content',
    'streamhub-sdk/content/types/livefyre-facebook-content',
    'streamhub-sdk/content/types/livefyre-oembed',
    'streamhub-sdk/storage'
], function(
    $,
    Stream,
    LivefyreStreamClient,
    LivefyreWriteClient,
    Content,
    LivefyreContent,
    LivefyreTwitterContent,
    LivefyreFacebookContent,
    LivefyreOembed,
    Storage
) {

    /**
     * Defines a livefyre stream that is readable and writable from and to a livefyre conversation.
     * @param opts {Object} A set of options to config the stream client with
     * @exports streamhub-sdk/streams/livefyre-stream
     * @constructor
     */
    var LivefyreStream = function(opts) {
        Stream.call(this);
        this.opts = opts || {};
        this.network = opts.network;
        this.collectionId = opts.collectionId;
        this.commentId = opts.commentId;
        this.environment = opts.environment;
        this.contentBeingWritten = {};
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
            if (err && err != "Timeout") {
                self.emit('error', err);
                self._endRead();
                return;
            } else if (self._isReading === false) {
                self._endRead();
                return;
            } else if (data && !err) {
                var authors = data.authors;

                for (var i in data.states) {
                    var state = data.states[i];
                    self._handleState(state, authors);
                }
                self.commentId = data.maxEventId || 0;
            }
            // continually read until error
            // also, put it in a setTimeout so that we clear the stack
            setTimeout(function() { self._read(); }, 1);
        });
    };

    /**
     * Handles the creation of a piece of content from a given json "state".
     * @param state {Object} The "state" of a piece of content as retrieved from the stream.
     * @param authors {Object} A key-value pair of author name/details retrieved from the current
     *        stream request.
     * @returns {Content} The new piece of content created from the given state.
     * @private
     */
    LivefyreStream.prototype._handleState = function (state, authors) {
        var self = this,
            content,
            thisContentBeingWritten,
            allChildren;
        if (state.content && state.content.authorId) {
            state.author = authors[state.content.authorId];
            content = LivefyreStream.createContent(state);
            thisContentBeingWritten = self.contentBeingWritten[state.content.id];
            if (thisContentBeingWritten) {
                // Ensure the existing Content gets set with new properties like ID
                thisContentBeingWritten.set(content);
                content = thisContentBeingWritten;
                delete self.contentBeingWritten[state.content.id];
            }
            if (state.content.targetId) {
                if (Storage.get(state.content.targetId)) {
                    parentContent = Storage.get(state.content.targetId);
                    parentContent.addAttachment(content);
                } else {
                   // put this oembed/reply in storage for later if we receive the parent
                   allChildren = Storage.get('children_' + state.content.targetId) || [];
                   allChildren.push(content);
                   Storage.set('children_' + state.content.targetId, allChildren); 
                }
            } else if (state.content.parentId) {
                if (Storage.get(state.content.parentId)) {
                    parentContent = Storage.get(state.content.parentId);
                    parentContent.addReply(content);
                } else {
                   // put this oembed/reply in storage for later if we receive the parent
                   allChildren = Storage.get('children_' + state.content.parentId) || [];
                   allChildren.push(content);
                   Storage.set('children_' + state.content.parentId, allChildren);
                }
            } else if (state.type === 0) {
                if (content.id) {
                    // check to see if we've previously received children for this content
                    var children = Storage.get('children_' + content.id);
                    for (var i in children) {
                        if (children[i] instanceof LivefyreOembed) {
                            content.addAttachment(children[i]);
                        } else {
                            content.addReply(children[i]);
                        }
                    }
                    Storage.set('children_' + content.id, []);
                }
                self._push(content);
            }

            if (content && content.id) {
                Storage.set(content.id, content);
            }
            return content;
        }
    };

    /**
     * Writes data to the Livefyre stream.
     * @param content {String|Content} A string or Content instance to write to the Stream.
     *     If `content` is an object with a `tweetId` property, that tweet will be written to the Stream
     * @param opts {Object} Options to pass to the LivefyreWriteClient
     * @param opts.lftoken {String} A Livefyre authentication token
     * @param [callback] {Function} A callback to be called when the write succeeds.
     *     It will be passed `(err, writtenContent)`
     * @private
     */
    LivefyreStream.prototype._write = function(content, opts, callback) {        
        var params,
            self = this,
            post = LivefyreWriteClient.postContent,
            attachments;

        if ( ! opts || ! opts.lftoken) {
            throw new Error("LivefyreStream::write must be passed opts.lftoken");
        }

        if (typeof content === 'string') {
            content = new Content(content);
        }

        params = {
            network: this.network,
            collectionId: this.collectionId,
            lftoken: opts.lftoken,
            body: content.body
        };
        
        if (content.parentId) {
            params.parent_id = content.parentId;
        }

        if (content.attachments && content.attachments.length) {
            params.media = [];
            $(content.attachments).each(function (index, attachment) {
                params.media.push(attachment.toJSON());
            });
        }

        // Use postTweet method if writing a .tweetId
        if (content.tweetId) {
            params.tweetId = content.tweetId;
            post = LivefyreWriteClient.postTweet;
            self.contentBeingWritten['tweet-{id}@twitter.com'.replace('{id}',content.tweetId)] = content;
        }

        post(params, function (err, response) {
            if ( ! callback ) {
                return;
            }
            if (err) {
                callback.call(self, err, null);
                return;
            }
            var state = response.data.messages[0],
                authors = response.data.authors;
            state.author = authors[state.content.authorId];
            var newContent = LivefyreStream.createContent(state);
            content.set(newContent);
            callback.call(self, null, content);
        });
    };

    /**
     * Creates the correct content type given the supplied "state".
     * @param state {Object} The livefyre content "state" as received by the client.
     * @return {LivefyreContent} A new, correctly typed, content object. 
     */
    LivefyreStream.createContent = function(state) {
        var sourceName = LivefyreContent.SOURCES[state.source];

        if (state.type === 3) {
            return new LivefyreOembed(state);
        } else if (sourceName === 'twitter') {
            return new LivefyreTwitterContent(state);
        } else if (sourceName === 'facebook') {
            return new LivefyreFacebookContent(state);
        } else {
            return new LivefyreContent(state);
        }
    };

    return LivefyreStream;
});
