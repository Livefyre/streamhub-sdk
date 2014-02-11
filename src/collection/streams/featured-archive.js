define([
    'streamhub-sdk/jquery',
    'stream/readable',
    'streamhub-sdk/collection/clients/bootstrap-client',
    'streamhub-sdk/content/state-to-content',
    'streamhub-sdk/debug',
    'inherits'],
function ($, Readable, BootstrapClient, StateToContent, debug, inherits) {
    "use strict";


    var log = debug('streamhub-sdk/collection/streams/featured-archive');


    /**
     * A Readable Stream that emits Featured Content for a Livefyre Collection.
     *     This Stream emits Content in descending order by featured value.
     * @param opts {object} Configuration options
     * @param opts.collection {string} The Collection to get Featured Content for
     * @param [opts.bootstrapClient] {LivefyreBootstrapClient} A Client object
     *     that can request StreamHub's Bootstrap web service
     */
    var FeaturedArchive = function (opts) {
        opts = opts || {};

        this._collection = opts.collection;
        this._fetchedHead = false;
        this._bootstrapClient = opts.bootstrapClient || new BootstrapClient();
        this._contentIdsInHeadDocument = [];

        Readable.call(this, opts);
    };

    inherits(FeaturedArchive, Readable);


    /**
     * Called by Readable base class. Do not call directly
     * Get content from bootstrap and .push() onto the read buffer
     * @private
     */
    FeaturedArchive.prototype._read = function () {
        var self = this;

        log('_read', 'Buffer length is ' + this._readableState.buffer.length);

        // The first time this is called, we first need to get Bootstrap init
        // to get the featured head and to know if there are more past that
        if ( ! this._fetchedHead) {
            return this._collection.initFromBootstrap(function (err, initData) {
                var featuredHead = initData.featured;

                if ( ! featuredHead) {
                    // There are no featured items. end
                    return self.push(null);
                }

                // If featured.isComplete is false, then there is more featured
                // content at the featured-all bootstrap page
                self._nextPage = featuredHead.isComplete ? null : 'featured-all';

                var contents = self._contentsFromBootstrapDoc(featuredHead, {
                    isHead: true
                });

                self._fetchedHead = true;

                self.push.apply(self, contents);
            });
        }
        // After that, request featured-all
        if (this._nextPage === null) {
            return this.push(null);
        }
        if (this._nextPage) {
            this._readNextPage();
        }
    };


    /**
     * Read the next Page of data from the Collection
     * And make sure not to emit any state.events that were in the headDocument
     * ._push will eventually be called.
     * @private
     */
    FeaturedArchive.prototype._readNextPage = function () {
        var self = this,
            bootstrapClientOpts = this._getBootstrapClientOptions();

        // There is only one extra page of featured content: featured-all
        this._nextPage = null;

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
     * Get options to pass to this._bootstrapClient methods to specify
     * which Collection we care about
     * @private
     */
    FeaturedArchive.prototype._getBootstrapClientOptions = function () {
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
    FeaturedArchive.prototype._contentsFromBootstrapDoc = function (bootstrapDoc, opts) {
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


    return FeaturedArchive;
});
