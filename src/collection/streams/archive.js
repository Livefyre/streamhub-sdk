define([
    'streamhub-sdk/jquery',
    'stream/readable',
    'streamhub-sdk/collection/clients/bootstrap-client',
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
     * @param [opts.bootstrapClient] {LivefyreBootstrapClient} A Client object
     *     that can request StreamHub's Bootstrap web service
     */
    var CollectionArchive = function (opts) {
        opts = opts || {};

        this._collection = opts.collection;

        this._bootstrapClient = opts.bootstrapClient || new BootstrapClient();
        this._contentIdsInHeadDocument = [];

        Readable.call(this, opts);
    };

    inherits(CollectionArchive, Readable);


    /**
     * @private
     * Called by Readable base class. Do not call directly
     * Get content from bootstrap and .push() onto the read buffer
     */
    CollectionArchive.prototype._read = function () {
        var self = this;

        log('_read', 'Buffer length is ' + this._readableState.buffer.length);

        // The first time this is called, we first need to get Bootstrap init
        // to know what the latest page of data
        if (typeof this._nextPage === 'undefined') {
            return this._collection.initFromBootstrap(function (err, initData) {
                var headDocument = initData.headDocument,
                    collectionSettings = initData.collectionSettings,
                    archiveInfo = collectionSettings && collectionSettings.archiveInfo,
                    numPages = archiveInfo && archiveInfo.nPages;

                var contents = self._contentsFromBootstrapDoc(headDocument, {
                    isHead: true
                });

                // Bootstrap pages are zero-based. Store the highest 
                self._nextPage = numPages - 1;

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
            bootstrapClientOpts = this._getBootstrapClientOptions();
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

            var contents = self._contentsFromBootstrapDoc(data);

            if ( ! contents.length) {
                // Everything was a duplicate... fetch next page
                return self._read();
            }
            self.push.apply(self, contents);
        });
    };


    /**
     * @private
     * Get options to pass to this._bootstrapClient methods to specify
     * which Collection we care about
     */
    CollectionArchive.prototype._getBootstrapClientOptions = function () {
        return {
            environment: this._collection.environment,
            network: this._collection.network,
            siteId: this._collection.siteId,
            articleId: this._collection.articleId,
            page: this._nextPage
        };
    };


    /**
     * @private
     * Convert a bootstrapDocument to an array of Content models
     * @param bootstrapDocument {object} an object with content and authors keys
     *     e.g. http://bootstrap.livefyre.com/bs3/livefyre.com/4/NTg0/0.json
     * @return {Content[]} An array of Content models
     */
    CollectionArchive.prototype._contentsFromBootstrapDoc = function (bootstrapDoc, opts) {
        opts = opts || {};
        bootstrapDoc = bootstrapDoc || {};
        var self = this,
            states = bootstrapDoc.content || [],
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