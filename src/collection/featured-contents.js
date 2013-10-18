define([
    'streamhub-sdk/collection/streams/featured-archive'],
function (FeaturedArchive) {
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

    return FeaturedContents;
});