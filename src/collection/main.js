define([
    'streamhub-sdk/collection/streams/archive',
    'streamhub-sdk/collection/streams/updater',
    'streamhub-sdk/collection/streams/writer',
    'streamhub-sdk/collection/featured-contents',
    'stream/duplex',
    'streamhub-sdk/collection/clients/bootstrap-client',
    'streamhub-sdk/collection/clients/create-client',
    'streamhub-sdk/collection/clients/write-client',
    'streamhub-sdk/auth',
    'inherits',
    'streamhub-sdk/debug'],
function (CollectionArchive, CollectionUpdater, CollectionWriter, FeaturedContents,
        Duplex, LivefyreBootstrapClient, LivefyreCreateClient, LivefyreWriteClient,
        Auth, inherits, debug) {
    'use strict';


    var log = debug('streamhub-sdk/collection');


    /**
     * An Object that represents a hosted StreamHub Collection
     * @param [opts.replies=false] {boolean} Whether to stream out reply Content
     * from the Archives and Updaters
     */
    var Collection = function (opts) {
        opts = opts || {};
        this.id = opts.id;
        this.network = opts.network;
        this.siteId = opts.siteId;
        this.articleId = opts.articleId;
        this.environment = opts.environment;

        this._collectionMeta = opts.collectionMeta;
        this._signed = opts.signed;
        this._autoCreate = opts.autoCreate || true;
        this._maxInitAttempts = opts.maxInitAttempts || 4;
        this._replies = opts.replies || false;

        this._bootstrapClient = opts.bootstrapClient || new LivefyreBootstrapClient();
        this._createClient = opts.createClient || new LivefyreCreateClient();

        // Internal streams
        this._writer = opts.writer || null;
        this._updater = null;
        this._pipedArchives = [];

        Duplex.call(this, opts);
    };

    inherits(Collection, Duplex);


    /**
     * Create a readable stream that will read through the Collection Archive
     * The Collection Archive contains older Content in the Collection
     * @param opts {object}
     * @param [opts.bootstrapClient] {BootstrapClient} A bootstrapClient to
     *     construct the CollectionArchive with
     * @returns {streamhub-sdk/streams/collection-archive}
     */
    Collection.prototype.createArchive = function (opts) {
        opts = opts || {};
        opts.collection = this;
        opts.bootstrapClient = opts.bootstrapClient || this._bootstrapClient;
        opts.replies = opts.replies || this._replies;
        return new CollectionArchive(opts);
    };


    /**
     * Create a Readable Stream that will stream any new updates to the
     * collection like additions, removals, edits, etc.
     */
    Collection.prototype.createUpdater = function (opts) {
        opts = opts || {};
        return new CollectionUpdater({
            collection: this,
            streamClient: opts.streamClient,
            replies: this._replies,
            createStateToContent: opts.createStateToContent,
            createAnnotator: opts.createAnnotator
        });
    };


    Collection.prototype.createWriter = function (opts) {
        opts = opts || {};
        opts.collection = this;
        return new CollectionWriter(opts);
    };


    /**
     * Create a FeaturedContents object representing the featured
     * contents in this Collection
     */
    Collection.prototype.createFeaturedContents = function (opts) {
        opts = opts || {};
        opts.collection = this;
        return new FeaturedContents(opts);
    };


    /**
     * Pipe updates in the Collection the passed destination Writable
     * @param writable {Writable} The destination to pipe udpates to
     * @param opts {object}
     * @param [opts.pipeArchiveToMore=true] Whether to try to pipe
     *     a CollectionArchive to writable.more, if it is also writable
     *     This is helpful when piping to a ListView
     * @param [opts.archivePipeOpts] Options to pass to archive.pipe,
     *     if you use it (defaults to opts param)
     */
    Collection.prototype.pipe = function (writable, opts) {
        var archive;
        opts = opts || {};
        var archivePipeOpts = opts.archivePipeOpts || opts;
        if (typeof opts.pipeArchiveToMore === 'undefined') {
            opts.pipeArchiveToMore = true;
        }

        // If piped to a ListView (or something with a .more),
        // pipe an archive to .more
        if (opts.pipeArchiveToMore && writable.more && writable.more.writable) {
            archive = this.createArchive();
            archive.pipe(writable.more, archivePipeOpts);
            this._pipedArchives.push(archive);
        }

        return Duplex.prototype.pipe.apply(this, arguments);
    };

    /**
     * Pause live updates from this Collection
     */
    Collection.prototype.pause = function () {
        Duplex.prototype.pause.apply(this, arguments);
        if (this._updater) {
            this._updater.pause();
        }
    };

    /**
     * Resume live updates from this Collection
     */
    Collection.prototype.resume = function () {
        Duplex.prototype.resume.apply(this, arguments);
        if (this._updater) {
            this._updater.resume();
        }
    };

    Collection.prototype._read = function () {
        var self = this,
            content;

        // Create an internal updater the first time the Collection is piped
        if ( ! this._updater) {
            this._updater = this.createUpdater();
        }

        content = this._updater.read();

        if ( ! content) {
            // Wait for Content to be available
            return self._updater.on('readable', function readAndPush() {
                var content = self._updater.read();
                if (content) {
                    self._updater.removeListener('readable', readAndPush);
                    self.push(content);
                }
            });
        }

        return this.push(content);
    };


    Collection.prototype._write = function _write (content, done) {
        if ( ! this._writer) {
            this._writer = this.createWriter();
        }
        this._writer.write(content, done);
    };


    Collection.prototype.initFromBootstrap = function (errback) {
        var self = this;
        if (errback) {
            this.once('_initFromBootstrap', errback);
        }
        if (this._isInitingFromBootstrap) {
            return;
        }
        this._isInitingFromBootstrap = true;
        this._getBootstrapInit(function (err, initData) {
            self._isInitingFromBootstrap = false;
            if (err && err.toLowerCase() === 'not found' && this._autoCreate) {
                this._createCollection(function (err) {
                    // Should always poll for init file to be created. If the
                    // collection successfullly created this time (202), then
                    // we should wait. It it's a conflict (409), then it was
                    // already created and we should wait.
                    if (!err || err.toLowerCase() === 'conflict') {
                        self._pollForBootstrapLoaded();
                    }
                });
                return;
            }
            this._handleInitComplete(err, initData);
        });
    };


    /**
     * Process the bootstrap init complete state. When the init file is fetched,
     * this processes and emits an event.
     * @param {string} err The error string.
     * @param {Object=} initData The data from the init file.
     * @private
     */
    Collection.prototype._handleInitComplete = function (err, initData) {
        if (!initData) {
            throw 'Fatal collection connection error';
        }
        var collectionSettings = initData.collectionSettings;
        this.id = collectionSettings && collectionSettings.collectionId;
        this.emit('_initFromBootstrap', err, initData);
    };


    /**
     * Poll the bootstrap init file to wait for it to be created. If it has
     * reached the max attempts, don't keep doing it.
     * @param {number=} opt_attempt Optional number of attempts made to fetch.
     */
    Collection.prototype._pollForBootstrapLoaded = function (opt_attempt) {
        var attempt = opt_attempt || 1;
        var self = this;
        this._getBootstrapInit(function (err, initData) {
            if (err && err.toLowerCase() === 'not found') {
                attempt++;
                if (attempt < this._maxInitAttempts) {
                    setTimeout(function () {
                        self._pollForBootstrapLoaded(attempt);
                    }, attempt * 1000);
                }
                return;
            }
            this._handleInitComplete(err, initData);
        });
    };


    /**
     * Request the Bootstrap init endpoint for the Collection to learn about
     * what pages of Content there are. This gets called the first time Stream
     * base calls _read().
     * @private
     * @param errback {function} A callback to be passed (err|null, the number
     *     of pages of content in the collection, the headDocument containing
     *     the latest data)
     */
    Collection.prototype._getBootstrapInit = function (errback) {
        var self = this,
            collectionOpts;

        // Use this._bootstrapClient to request init (init is default when
        // no opts.page is specified)
        collectionOpts = {
            network: this.network,
            siteId: this.siteId,
            articleId: this.articleId,
            environment: this.environment
        };
        this._bootstrapClient.getContent(collectionOpts, function (err, data) {
            if (err) {
                log("Error requesting Bootstrap init", err, data);
            }
            errback.call(self, err, data);
        });
    };


    /**
     * @callback optionalObjectCallback
     * @param [error] {Object}
     */


    /**
     * Request the Create endpoint to create an entirely new collection. This
     * gets called when Bootstrap initialization fails.
     * @private
     * @param errback {optionalObjectCallback} Optional callback to be passed an object on
     *      error or undefined on success.
     */
    Collection.prototype._createCollection = function (errback) {
        if (this._isCreatingCollection) {
            throw 'Attempting to create a collection more than once.';
        }
        this._isCreatingCollection = true;

        var self = this;
        this._autoCreate = false;
        this.once('_createCollection', errback);
        var callback = function (err) {
            self._isCreatingCollection = false;
            if (err) {
                log("Error requesting collection creation", err);
            }
            self.emit('_createCollection', err);
        };

        // Use this._createClient to request a collection creation
        var collectionOpts = {
            network: this.network,
            siteId: this.siteId,
            articleId: this.articleId,
            environment: this.environment,
            collectionMeta: this._collectionMeta,
            signed: this._signed
        };
        this._createClient.createCollection(collectionOpts, callback);
    };


    return Collection;
});
