define([
    'streamhub-sdk/collection/streams/archive',
    'streamhub-sdk/collection/streams/updater',
    'streamhub-sdk/collection/streams/writer',
    'stream/duplex',
    'streamhub-sdk/collection/clients/bootstrap-client',
    'streamhub-sdk/collection/clients/write-client',
    'streamhub-sdk/auth',
    'inherits',
    'streamhub-sdk/debug'],
function (CollectionArchive, CollectionUpdater, CollectionWriter, Duplex,
LivefyreBootstrapClient, LivefyreWriteClient, Auth, inherits, debug) {
    'use strict';


    var log = debug('streamhub-sdk/collection');


    /**
     * An Object that represents a hosted StreamHub Collection
     */
    var Collection = function (opts) {
        opts = opts || {};
        this.network = opts.network;
        this.siteId = opts.siteId;
        this.articleId = opts.articleId;
        this.environment = opts.environment;

        this._bootstrapClient = opts.bootstrapClient || new LivefyreBootstrapClient();

        // Internal streams
        this._writer = opts.writer || this.createWriter();
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
            bootstrapClient: opts.bootstrapClient
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
            streamClient: opts.streamClient
        });
    };


    Collection.prototype.createWriter = function (opts) {
        opts = opts || {};
        return new CollectionWriter({
            collection: this,
            writeClient: opts.writeClient
        });
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

        Duplex.prototype.pipe.apply(this, arguments);

        // If piped to a ListView (or something with a .more),
        // pipe an archive to .more
        if (opts.pipeArchiveToMore && writable.more && writable.more.writable) {
            archive = this.createArchive();
            archive.pipe(writable.more);
            this._pipedArchives.push(archive);
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
            return self._updater.once('readable', function () {
                self.push(self._updater.read());
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
        this.once('_initFromBootstrap', errback);
        if (this._isInitingFromBootstrap) {
            return;
        }
        this._isInitingFromBootstrap = true;
        this._getBootstrapInit(function (err, initData) {
            var collectionSettings = initData.collectionSettings;
            self.id = collectionSettings && collectionSettings.collectionId;
            self._isInitingFromBootstrap = false;
            self.emit('_initFromBootstrap', err, initData);
        });
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


    return Collection;
});