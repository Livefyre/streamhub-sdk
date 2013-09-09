define([
    'jquery',
    'stream/readable',
    'streamhub-sdk/clients/livefyre-bootstrap-client',
    'streamhub-sdk/content/state-to-content',
    'streamhub-sdk/debug',
    'inherits'],
function ($, Readable, BootstrapClient, StateToContent, debug, inherits) {
    "use strict";


    var log = debug('streamhub-sdk/streams/collection-archive');


    /**
     * A Readable Stream that emits Content for a Livefyre Collection as
     *     sourced from StreamHub's Bootstrap APIs. This Stream emits Content
     *     in descending order by bootstrap page
     * @param opts {object} Configuration options
     * @param opts.network {string} The StreamHub Network of the Collection
     * @param opts.siteId {string} The StreamHub Site ID of the Collection
     * @param opts.articleId {string} The StreamHub Aritcle ID of the Collection
     * @param [opts.environment] {string} If not production, the hostname of the
     *     StreamHub environment the Collection resides on
     */
    function CollectionArchive (opts) {
        opts = opts || {};

        this._network = opts.network;
        this._siteId = opts.siteId;
        this._articleId = opts.articleId;
        this._environment = opts.environment;

        this._bootstrapClient = opts.bootstrapClient || BootstrapClient;
        this._isInitingFromBootstrap = false;
        this._finishedInitFromBootstrap = false;
        this._contentIdsInHeadDocument = [];

        Readable.call(this, opts);
    }

    inherits(CollectionArchive, Readable);


    /**
     * @private
     * Called by Readable base class. Do not call directly
     * Get content from bootstrap and .push() onto the read buffer
     */
    CollectionArchive.prototype._read = function () {
        var self = this,
            bootstrapClientOpts,
            stateToPush;
        log('_read', 'Buffer length is ' + this._readableState.buffer.length);

        // The first time this is called, we first need to get Bootstrap init
        // to know what the latest page of data
        if ( ! this._finishedInitFromBootstrap) {
            log('requesting bootstrap init');
            return this._getBootstrapInit(function (err, nPages, headDocument) {
                var contents = self._contentsFromBootstrapDoc(headDocument, {
                        isHead: true
                    });

                // Bootstrap pages are zero-based. Store the highest 
                self._nextPage = nPages - 1;

                self.push.apply(self, contents);
            });
        }
        // After that, request the latest page
        // unless there are no more pages, in which case we're done
        if (this._nextPage === null) {
            return this.push(null);
        }
        if (typeof this._nextPage === 'number') {
            this._readNextPage();
        }
    };


    /**
     * @private
     * Read the next Page of data from the Collection
     * And make sure not to emit any state.events that were in the headDocument
     * ._push will eventually be called.
     */
    CollectionArchive.prototype._readNextPage = function () {
        var self = this,
            bootstrapClientOpts = this._getCollectionOptions();
        bootstrapClientOpts.page = this._nextPage;
        this._nextPage = this._nextPage - 1;
        if (this._nextPage < 0) {
            // No more pages
            this._nextPage = null;
        }
        this._bootstrapClient.getContent(bootstrapClientOpts, function (err, data) {
            if (err || ! data) {
                self.emit('error', new Error('Error requesting Bootstrap page '+bootstrapClientOpts.page));
                return;
            }
            var states = data.content,
                contents = self._contentsFromBootstrapDoc(data);

            if ( ! contents.length) {
                // Everything was a duplicate... fetch next page
                return self._readNextPage();
            }
            self.push.apply(self, contents);
        });
    };


    /**
     * @private
     * Get options to pass to this._bootstrapClient methods to specify
     * which Collection we care about
     */
    CollectionArchive.prototype._getCollectionOptions = function () {
        return {
            environment: this._environment,
            network: this._network,
            siteId: this._siteId,
            articleId: this._articleId
        };
    };


    /**
     * @private
     * Request the Bootstrap init endpoint for the Collection to learn about
     * what pages of Content there are. This gets called the first time Stream
     * base calls _read().
     * @param errback {function} A callback to be passed (err|null, the number
     *     of pages of content in the collection, the headDocument containing
     *     the latest data)
     */
    CollectionArchive.prototype._getBootstrapInit = function (errback) {
        var self = this,
            collectionOpts;

        if (this._isInitingFromBootstrap) {
            log("_getBootstrapInit was called, but I'm already requesting " +
                "init and haven't gotten a response. This probably shouldn't " +
                "happen.");
            return;
        }
        this._isInitingFromBootstrap = true;

        // Use this._bootstrapClient to request init (init is default when
        // no opts.page is specified)
        collectionOpts = this._getCollectionOptions();
        this._bootstrapClient.getContent(collectionOpts, function (err, data) {
            if (err) {
                log("Error requesting Bootstrap init", err, data);
                self.emit('error', err);
            }

            var headDocument = data.headDocument,
                collectionSettings = data.collectionSettings,
                archiveInfo = collectionSettings && collectionSettings.archiveInfo,
                numPages = archiveInfo && archiveInfo.nPages;

            self._isInitingFromBootstrap = false;
            self._finishedInitFromBootstrap = true;

            errback.call(self, err, numPages, headDocument);
        });
    };


    /**
     * @private
     * Convert a bootstrapDocument to an array of Content instances
     * @param bootstrapDocument {object} an object with content and authors keys
     *     e.g. http://bootstrap.livefyre.com/bs3/livefyre.com/4/NTg0/0.json
     */
    CollectionArchive.prototype._contentsFromBootstrapDoc = function (bootstrapDoc, opts) {
        opts = opts || {};
        bootstrapDoc = bootstrapDoc || {};
        var self = this,
            states = bootstrapDoc.content || [],
            authors = bootstrapDoc.authors || {},
            stateToContent = new StateToContent(bootstrapDoc),
            state,
            content,
            contents = [];

        stateToContent.on('data', function (content) {
            if (! content ||
                self._contentIdsInHeadDocument.indexOf(content.id) !== -1) {
                return;
            }
            if (opts.isHead && content.id) {
                self._contentIdsInHeadDocument.push(content.id);
            }
            contents.push(content);
        });

        for (var i=0, statesCount=states.length; i < statesCount; i++) {
            state = states[i];
            content = stateToContent.write(state);
        }

        log("created contents from bootstrapDoc", contents);
        return contents;
    };


    return CollectionArchive;
});