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
        this.settings = {};

        this._collectionMeta = opts.collectionMeta;
        this._signed = opts.signed;
        this._autoCreate = opts.autoCreate || true;
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
        return new CollectionArchive({
            collection: this,
            bootstrapClient: opts.bootstrapClient || this._bootstrapClient,
            replies: this._replies
        });
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
     */
    Collection.prototype.pipe = function (writable, opts) {
        var archive;
        opts = opts || {};
        if (typeof opts.pipeArchiveToMore === 'undefined') {
            opts.pipeArchiveToMore = true;
        }

        // If piped to a ListView (or something with a .more),
        // pipe an archive to .more
        if (opts.pipeArchiveToMore && writable.more && writable.more.writable) {
            archive = this.createArchive();
            archive.pipe(writable.more);
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
                    if (!err) {
                        self.initFromBootstrap();
                    }
                });
                return;
            }
            if (!initData) {
                throw 'Fatal collection connection error';
            }
            var collectionSettings = initData.collectionSettings;
            if (collectionSettings) {
                self.id = collectionSettings.collectionId;
                self.settings.initEvent = collectionSettings.event;
            }
            self.emit('_initFromBootstrap', err, initData);
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
