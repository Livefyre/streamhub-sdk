define([
    'inherits',
    'streamhub-sdk/collection/streams/featured-archive',
    'streamhub-sdk/collection/streams/featured-updater',
    'streamhub-sdk/collection/streams/updater',
    'stream/readable'],
function (inherits, FeaturedArchive, FeaturedUpdater, CollectionUpdater, Readable) {
    'use strict';

    /**
     * An Object that represents the featured Contents in a StreamHub
     * Collection
     * @param opts {object} Options
     * @param opts.collection {streamhub-sdk/collection} The Collection in which
     *     you care about featured Content
     */
    var FeaturedContents = function (opts) {
        opts = opts || {};
        this._collection = opts.collection;
        this._pipedArchives = [];
        Readable.apply(this, arguments);
    };
    inherits(FeaturedContents, Readable);

    FeaturedContents.prototype.pipe = function (writable, opts) {
        opts = opts || {};

        var archive;
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

        return Readable.prototype.pipe.apply(this, arguments);
    };

    FeaturedContents.prototype._read = function () {
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

    /**
     * Create a readable stream that will read through the Archive of Featured
     * Contents in the Collection.
     * @param opts {object}
     * @returns {streamhub-sdk/collection/streams/featured-archive}
     */
    FeaturedContents.prototype.createArchive = function (opts) {
        opts = opts || {};
        opts.collection = this._collection;
        return new FeaturedArchive(opts);
    };

    FeaturedContents.prototype.createUpdater = function (opts) {
        opts = opts || {};
        opts.collection = this._collection;
        return new FeaturedUpdater(opts);
    };

    return FeaturedContents;
});
