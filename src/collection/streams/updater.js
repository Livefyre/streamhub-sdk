define([
    'inherits',
    'stream/readable',
    'stream/util',
    'streamhub-sdk/collection/clients/stream-client',
    'streamhub-sdk/content/state-to-content',
    'streamhub-sdk/content/annotator',
    'streamhub-sdk/debug'],
function (inherits, Readable, streamUtil, StreamClient,
StateToContent, Annotator, debug) {
    'use strict';


    var log = debug('streamhub-sdk/collection/streams/updater');


    /**
     * A Readable Stream to access streaming updates in a StreamHub Collection
     * @param opts {object}
     * @param opts.network {string} The StreamHub Network of the Collection
     * @param opts.siteId {string} The Site ID of the Collection
     * @param opts.articleId {string} The Article ID of the Collection
     * @param [opts.environment] {string} Which StreamHub Cluster the Collection
     *     resides on (e.g. t402.livefyre.com for UAT)
     * @param [opts.streamClient] {LivefyreStreamClient} A Client object that
     *     can request StreamHub's Stream web service
     * @param [opts.replies=false] {boolean} Whether to read out reply Content
     * @param [opts.createStateToContent] {function} Creates a custem Content adapter
     * @param [opts.maxErrors] {integer} Limit of exponential backoff
     */
    var CollectionUpdater = function (opts) {
        opts = opts || {};
        this._collection = opts.collection;
        this._streamClient = opts.streamClient || new StreamClient();
        this._request = null;
        this._replies = opts.replies || false;

        // fail for up to ~4 minutes before announcing an a fatal streaming error:
        //   integral 2*x*x dx x=0..maxErrors
        // http://www.wolframalpha.com/input/?i=integral+of+2*%28x*x%29+dx%2C+x%3D0..7
        this._maxErrors = opts.maxErrors || 7;
        this._errors = 0;

        // for cycle detection
        this._seenEventIds = [];
        if (opts.createStateToContent) {
            this._createStateToContent = opts.createStateToContent;
        }
        if (opts.createAnnotator) {
            this.createAnnotator = opts.createAnnotator;
        }
        Readable.call(this, opts);
    };

    inherits(CollectionUpdater, Readable);


    /**
     * Called by Readable base class on .read(). Do not call directly.
     * Get content from bootstrap and .push() onto the read buffer
     * @private
     */
    CollectionUpdater.prototype._read = function () {
        var self = this;
        log('_read', 'Buffer length is ' + this._readableState.buffer.length);

        if ( ! this._latestEvent || ! this._collection.id) {
            // Get the latest event and/or collection ID by initing
            // the collection from bootstrap
            return this._collection.initFromBootstrap(function (err, initData) {
                var collectionSettings = initData.collectionSettings;
                var headDocument = initData.headDocument;

                // Use the event value from the headDocument (new) over the
                // collectionSettings dict because it's newer. If it's not set
                // in headDocument, use the collectionSettings version.
                var latestEvent = headDocument && headDocument.event;
                latestEvent = latestEvent || collectionSettings && collectionSettings.event;

                if ( ! self._collection.id) {
                    throw new Error("Couldn't get Collection ID after initFromBootstrap");
                }
                if (latestEvent === undefined) {
                    throw new Error("Couldn't get latestEvent after initFromBootstrap");
                }
                self._updateStreamPosition(latestEvent);
                self._stream();
            });
        }

        self._stream();
    };


    /**
     * Make the next stream request to get more data since the last seen event
     * @private
     */
    CollectionUpdater.prototype._stream = function () {
        var self = this,
            streamClient = this._streamClient,
            streamClientOpts = this._getStreamClientOptions();

        var request = streamClient.getContent(streamClientOpts, function (err, data) {
            if (err && err.message === 'abort') {
                log('stream request aborted');
                self.push();
                return;
            }
            if (err) {
                self._errors++;
                if (self._errors > self._maxErrors) {
                    return self.emit('error', err);
                }
                setTimeout(pollAgain, self._getTimeoutAfterError());
                return;
            }
            // reset
            self._errors = 0;
            if (data.timeout) {
                // Timed out on the long poll. This just means there
                // was no real-time data. So we should keep streaming
                // on the next event loop tick
                log('long poll timeout, requesting again on next tick');
                return pollAgain();
            }
            var contents = self._contentsFromStreamData(data);
            var nextEventId = data.maxEventId;

            // If nextEventId is one we've seen before, dont use it!
            // increment the highest of what we've seen by one instead

            // Update _latestEvent so we only get new data
            self._updateStreamPosition(nextEventId);

            if (contents.length) {
                self.push.apply(self, contents);
                // _read will get called again when more data is needed
            } else {
                return pollAgain();
            }

            function pollAgain() {
                // Push nothing for now.
                self.push();
                // But trigger another _read cycle ASAP
                // This gives the internals a chance to check paused state
                streamUtil.nextTick(function () {
                    self.read(0);
                });
            }
        });

        this._request = request;
    };

    /**
     * Get the number of milliseconds before trying another stream request
     * after an error
     */
    CollectionUpdater.prototype._getTimeoutAfterError = function () {
        var numErrorsSinceSuccess = this._errors;
        var timeout = 2000 * Math.pow(numErrorsSinceSuccess, 2);
        return timeout;
    };

    /**
     * Maintains the stream cursor, with logic to ensure cycles are broken.
     */
    CollectionUpdater.prototype._updateStreamPosition = function (eventId) {
        var seenEventIds = this._seenEventIds;
        var seenBefore = seenEventIds.indexOf(eventId) !== -1;

        // we've detected a cycle which can occur under some
        // rare data conditions. This will break the cycle.
        if (seenBefore) {
            seenEventIds.sort();
            // find the newest event, and move past it
            // this will break the cycle in the cached data.
            eventId = seenEventIds[seenEventIds.length - 1] + 1;
        }

        // cap at 100
        while (seenEventIds.length > 100) {
            seenEventIds.shift();
        }

        seenEventIds.push(eventId);

        this._latestEvent = eventId;
    };

    /**
     * Pause the Updater
     * Including killing the active stream request
     */
    CollectionUpdater.prototype.pause = function () {
        if (this._request) {
            this._request.abort();
            this._request = null;
        }
        return Readable.prototype.pause.apply(this, arguments);
    };


    /**
     * Convert a response from the Stream service into Content models
     * @private
     * @param streamData {object} A response from the Stream service
     * @return {Content[]} An Array of Content models
     */
    CollectionUpdater.prototype._contentsFromStreamData = function (streamData) {
        var annotationDiff,
            annotator = this.createAnnotator(),
            annotations = streamData.annotations,
            contentId,
            contents = [],
            state,
            states = streamData.states,
            stateToContent = this._createStateToContent(streamData);

        stateToContent.on('data', function (content) {
            contents.push(content);
        });

        for (contentId in states) {
            if (states.hasOwnProperty(contentId)) {
                state = states[contentId];
                stateToContent.write(state);
            }
        }

        for (contentId in annotations) {
            if (annotations.hasOwnProperty(contentId)) {
                annotationDiff = annotations[contentId];
                this._handleAnnotationDiff(contentId, annotationDiff);
                annotator.write({
                    contentId: contentId,
                    annotationDiff: annotationDiff
                });
            }
        }

        return contents;
    };

    CollectionUpdater.prototype._handleAnnotationDiff = function (contentId, annotationDiff) {
        this.emit('annotationDiff', contentId, annotationDiff);
    };

    /**
     * Get an Object that can be passed to LivefyreStreamClient to get new
     * data
     * @private
     * @return {object}
     */
    CollectionUpdater.prototype._getStreamClientOptions = function () {
        return {
            collectionId: this._collection.id,
            network: this._collection.network,
            environment: this._collection.environment,
            commentId: this._latestEvent
        };
    };

    /**
     * Create a StateToContent Transform that will have states written in,
     * and should read out Content instances
     */
    CollectionUpdater.prototype._createStateToContent = function (opts) {
        opts = opts || {};
        opts.replies = this._replies;
        opts.collection = this._collection;
        return new StateToContent(opts);
    };

    /**
     * Create an Annotator that will mutate Content in Storage.
     */
    CollectionUpdater.prototype.createAnnotator = function () {
        return new Annotator();
    };

    return CollectionUpdater;
});
