define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/stream',
    'streamhub-sdk/streams/livefyre-stream',
    'streamhub-sdk/clients/livefyre-bootstrap-client',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-twitter-content',
    'streamhub-sdk/content/types/livefyre-facebook-content',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/storage'
], function(
    $, 
    Stream, 
    LivefyreStream,
    LivefyreBootstrapClient, 
    LivefyreContent, 
    LivefyreTwitterContent, 
    LivefyreFacebookContent, 
    Oembed, 
    Storage
) {

    /**
     * Defines a livefyre stream that is readable in reverse time order from a livefyre
     * conversation.
     * @param opts {Object} A set of options to config the stream client with
     * @param [opts.replies=false] {boolean} Whether the reverse stream should emit Content that is in reply to
     *     other Content.
     * @exports streamhub-sdk/streams/livefyre-reverse-stream
     * @constructor
     */
    var LivefyreReverseStream = function(opts) {
        Stream.call(this);
        opts = opts || {};
        this.network = opts.network;
        this.siteId = opts.siteId;
        this.articleId = opts.articleId;
        this.environment = opts.environment;
        this.followers = opts.followers || [];
        this.page = opts.page;
        this._pushReplies = opts.replies || false;
        this.plugins = this.plugins || [];
        if (opts.initData) {
            this._setInitData(opts.initData);
        }
    };
    $.extend(LivefyreReverseStream.prototype, Stream.prototype);

    /**
     * Reads data from a Livefyre bootstrap page endpoint.
     * @private
     */
    LivefyreReverseStream.prototype._read = function() {
        var self = this;

        if (this.page < 0) {
            return self._endRead();
        }

        var opts = {
            network: this.network,
            siteId: this.siteId,
            articleId: this.articleId,
            page: this.page ? this.page.toString() : null
        };
        if (this.environment) {
            opts.environment = this.environment;
        }
        if (this.headDocument && ! this._pushedHeadDocument) {
            self._handleBootstrapDocument(this.headDocument);
            this._pushedHeadDocument = true;
            self._endRead();
        } else {
            LivefyreBootstrapClient.getContent(opts, function (err, data) {
                if (err) {
                    self.emit('error', err);
                    self._endRead();
                    return;
                }
                if (data.headDocument) {
                    self._setInitData(data);
                    return self._read();
                }
                self._handleBootstrapDocument(data);
                self.page--;
                self._endRead();
            });
        }
    };

    /**
     * Pass a Bootstrap Init JSON document to the stream to set its internal state
     * Including headDocument and the latest page
     * @param initData {object} An object like the response here:
     *     http://bootstrap.labs-t402.fyre.co/bs3/t402.livefyre.com/labs-t402.fyre.co/303827/Y29udGV4dHVhbF8x/init
     */
    LivefyreReverseStream.prototype._setInitData = function (initData) {
        var collectionSettings = initData.collectionSettings,
            pages = collectionSettings.archiveInfo.pageInfo,
            pageKeys = Object.keys(pages);
        pageKeys.sort();
        this.page = pageKeys[pageKeys.length - 1];
        this._setHeadDocument(initData.headDocument);
    };

    /**
     * Tell the stream about a headDocument. On ._read(), the headDocument Content
     * will be emitted before everything else. The Stream will also get its page from here
     * @param headDocument {object] An object like the headDocument property in this response:
     *     http://bootstrap.labs-t402.fyre.co/bs3/t402.livefyre.com/labs-t402.fyre.co/303827/Y29udGV4dHVhbF8x/init
     */
    LivefyreReverseStream.prototype._setHeadDocument = function (headDocument) {
        this.headDocument = headDocument;
        this._pushedHeadDocument = false;
        this._headDocumentContentIds = this.getContentIdsFromBootstrapDocument(this.headDocument);
    };

    /**
     * Process a bootstrap response, creating content and ._pushing along the way
     */
    LivefyreReverseStream.prototype._handleBootstrapDocument = function (data) {
        var authors = data.authors || {};
        if (this._isReading === false) {
            this._endRead();
            return;
        }
        for (var i in data.content) {
            var state = data.content[i];
            this._handleState(state, authors);
        }
    };

    /**
     * Process a state object from Livefyre's Bootstrap APIs.
     * State objects are objects like those in headDocument.content[] here: http://bootstrap.livefyre.com/bs3/livefyre.com/4/NTg0/init
     * They can contain .childContent[] arrays that contain more states, so this function may call itself recursively.
     * Only top-level states will be pushed through the stream, unless the stream is constructed with opts.replies=true.
     * Attachments and Replies will always be added to their parent content.
     * @param state {object} A State object from Livefyre's Bootstrap APIs
     * @param authors {object} An object mapping authorIds to author information. Like headDocument.authors in above sample response
     */
    LivefyreReverseStream.prototype._handleState = function (state, authors) {
        var alreadyPushed = (this._pushedHeadDocument) && (this._headDocumentContentIds.indexOf(state.content.id) !== -1),
            isPublic = (typeof state.vis === 'undefined') ? true : (state.vis === 1),
            isReply = state.content.parentId,
            childStates = state.childContent || [],
            content;

        // Don't emit non-visible Content or Content that was already pushed via headDocument
        if ( ! isPublic || alreadyPushed) {
            return;
        }

        state.author = authors[state.content.authorId];
        content = this.createContent(state);

        if (content && content.id) {
            Storage.set(content.id, content);
        }

        // Push content. Only push replies if this stream was configured to push them
        if (content && ( ! isReply || ( isReply && this._pushReplies) )) {
            this._push(content);
        }

        for (var i=0, numChildren=childStates.length; i < numChildren; i++) {
            var childContent = this._handleState(state.childContent[i], authors);
            if (childContent instanceof Oembed) {
                content.addAttachment(childContent);
            } else {
                content.addReply(childContent);
            }
        }

        return content;
    };

    /**
     * Create a Content instance from a state in the stream
     * @param state {object} A JSON state from StreamHub Bootstrap API
     * @returns {Content}
     */
    LivefyreReverseStream.prototype.createContent = function (state) {
        var content = LivefyreStream.createContent(state),
            plugins = this.plugins;
        if (content) {
            return content;
        }
        for (var i=0; i < plugins.length; i++) {
            var plugin = plugins[i];
            try {
                return plugin(state);
            } catch (e) {
                continue;
            }
        }
    };

    /**
     * Get the Content Ids from a JSON object response from StreamHub's Bootstrap Service
     * @returns {string[]}
     */
    LivefyreReverseStream.prototype.getContentIdsFromBootstrapDocument = function (data) {
        data = data || {};
        var states = data.content || [];
        var contentIds = $.map(states, function (state) {
            return state.content.id;
        });
        return contentIds;
    };

    return LivefyreReverseStream;
});
