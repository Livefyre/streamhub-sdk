define([
    'streamhub-sdk/jquery',
    'stream/readable',
    'streamhub-sdk/collection/clients/bootstrap-client',
    'streamhub-sdk/content/state-to-content',
    'streamhub-sdk/debug',
    'stream/util',
    'inherits'],
function ($, Readable, BootstrapClient, StateToContent, debug, streamUtil,
inherits) {
    "use strict";


    var log = debug('streamhub-sdk/collection/streams/archive');


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
     * @param [opts.replies=false] {boolean} Whether to read out reply Content
     * @param [opts.comparator] Indicate the order in which you'd like to read
     *     the archive. Default is CollectionArchive.comparators.CREATED_AT_DESCENDING
     *     (newest first). You can also pass other values of CollectionArchive.comparators
     */
    var CollectionArchive = function (opts) {
        opts = opts || {};

        this._collection = opts.collection;

        this._bootstrapClient = opts.bootstrapClient || new BootstrapClient();
        this._contentIdsInHeadDocument = [];
        this._replies = opts.replies || false;
        this._comparator = opts.comparator || CollectionArchive.comparators.CREATED_AT_DESCENDING;

        Readable.call(this, opts);
    };

    inherits(CollectionArchive, Readable);

    /**
     * Comparators that determine the order in which to get data out of the
     * archive
     */
    CollectionArchive.comparators = {
        CREATED_AT_ASCENDING: 'CREATED_AT_ASCENDING',
        CREATED_AT_DESCENDING: 'CREATED_AT_DESCENDING'
    };

    /**
     * Called by Readable base class. Do not call directly
     * Get content from bootstrap and .push() onto the read buffer
     * @private
     */
    CollectionArchive.prototype._read = function () {
        log('_read', 'Buffer length is ' + this._readableState.buffer.length);
        // The first time this is called, we first need to get Bootstrap init
        // to know what the latest page of data
        if (typeof this._nextPage === 'undefined') {
            return this._readFirstPage();
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
     * Read the first page of data from the archive.
     * Depending on the comparator, this will either be the 0th page or the
     * init page
     * Then set the appropriate ._nextPage value
     * @private
     */
    CollectionArchive.prototype._readFirstPage = function () {
        var self = this;
        // If ascending, we start at page 0 and will go up from there
        if (this._comparator === CollectionArchive.comparators.CREATED_AT_ASCENDING) {
            this._nextPage = 0;
            this._readNextPage();
            return;
        }
        // Otherwise, we need to get the first page of data from the init document
        // and note the total number of pages, and work our way down to 0 from there
        return this._collection.initFromBootstrap(function (err, initData) {
            var headDocument = initData.headDocument,
                collectionSettings = initData.collectionSettings,
                archiveInfo = collectionSettings && collectionSettings.archiveInfo,
                numPages = archiveInfo && archiveInfo.nPages;

            if (numPages === 0) {
                self.push(null);
                return;
            }

            var contents = self._contentsFromBootstrapDoc(headDocument, {
                isHead: true
            });

            // Bootstrap pages are zero-based. Store the highest 
            self._nextPage = numPages - 1;

            // If we couldn't create any Content from the headDocument
            // e.g. they were all premodded, push nothing and read again
            // soon
            if ( ! contents.length) {
                // Push nothing for now.
                self.push();
                // But trigger another _read cycle ASAP
                // This gives the internals a chance to check paused state
                streamUtil.nextTick(function () {
                    self.read(0);
                });
                return;
            }
            self.push.apply(self, contents);
        });
    };

    /**
     * Read the next Page of data from the Collection
     * And make sure not to emit any state.events that were in the headDocument
     * ._push will eventually be called.
     * @private
     */
    CollectionArchive.prototype._readNextPage = function () {
        var self = this,
            bootstrapClientOpts = this._getBootstrapClientOptions();
        this._nextPage = this._getNextPageName();
        this._bootstrapClient.getContent(bootstrapClientOpts, function (err, data) {
            var requestedPage = bootstrapClientOpts.page;
            if (err && err.statusCode === 404) {
                log('404 when requesting page '+requestedPage+'. Must be end of archive');
                self._nextPage = null;
                self._read();
                return;
            }
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
     * Get the value to pass as the `page` param to the bootstrapClient
     * To get the next page of data
     * It should increment or decrement from the last page value, depending
     * on this Archive's comparator
     */
    CollectionArchive.prototype._getNextPageName = function () {
        var curPage = this._nextPage;
        var nextPage;
        switch (this._comparator) {
            case CollectionArchive.comparators.CREATED_AT_ASCENDING:
                nextPage = curPage + 1;
                break;
            case CollectionArchive.comparators.CREATED_AT_DESCENDING:
                nextPage = curPage - 1;
                if (nextPage < 0) {
                    nextPage = null;
                }
                break;
        }
        return nextPage;
    };

    /**
     * Get options to pass to this._bootstrapClient methods to specify
     * which Collection we care about
     * @private
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
     * Convert a bootstrapDocument to an array of Content models
     * @private
     * @param bootstrapDocument {object} an object with content and authors keys
     *     e.g. http://bootstrap.livefyre.com/bs3/livefyre.com/4/NTg0/0.json
     * @return {Content[]} An array of Content models
     */
    CollectionArchive.prototype._contentsFromBootstrapDoc = function (bootstrapDoc, opts) {
        opts = opts || {};
        bootstrapDoc = bootstrapDoc || {};
        var self = this,
            states = bootstrapDoc.content || [],
            state,
            stateContentId,
            content,
            contents = [];

        if (this._collection) {
            bootstrapDoc.collection = this._collection;
        }
        var stateToContent = this._createStateToContent(bootstrapDoc);

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
            stateContentId = state.content && state.content.id;
            // Don't write in states that we already wrote in from the
            // headDocument, as they'll cause unnecessary changes
            // and rerenders to Content in storage
            if (stateContentId && this._contentIdsInHeadDocument.indexOf(stateContentId) !== -1) {
                continue;
            }
            content = stateToContent.write(state);
        }

        contents = this._sortContents(contents);
        log("created contents from bootstrapDoc", contents);
        return contents;
    };

    /**
     * Sort an array of Contents in the ideal order for this archive's
     * comparator.
     */
    CollectionArchive.prototype._sortContents = function (contentList) {
        var contentListComparator;
        var sortedContentList;
        if (this._comparator === CollectionArchive.comparators.CREATED_AT_ASCENDING) {
            contentListComparator = function (contentA, contentB) {
                return contentA.createdAt - contentB.createdAt;
            };
        } else {
            // Must be descending. That's the default.
            // Change this if there are ever 3 comparator options
            contentListComparator = function (contentA, contentB) {
                return contentB.createdAt - contentA.createdAt;
            };
        }
        sortedContentList = contentList.sort(contentListComparator);
        return sortedContentList;
    };

    /**
     * Create a StateToContent Transform that will have states written in,
     * and should read out Content instances
     */
    CollectionArchive.prototype._createStateToContent = function (opts) {
        opts = opts || {};
        opts.replies = this._replies;
        return new StateToContent(opts);
    };


    return CollectionArchive;
});
