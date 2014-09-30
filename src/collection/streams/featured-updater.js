var inherits = require('inherits');
var Readable = require('stream/readable');
var PassThrough = require('stream/passthrough');
var util = require('stream/util');
var FeaturedFilter = require('streamhub-sdk/collection/streams/featured-filter');
var Storage = require('streamhub-sdk/storage');
var fetchContent = require('streamhub-sdk/content/fetch-content');
var debug = require('streamhub-sdk/debug');

'use strict';

var FeaturedUpdater = function (opts) {
    opts = opts || {};

    PassThrough.apply(this, arguments);

    this._collection = opts.collection;
    this._updater = this._collection.getOrCreateUpdater();
    if (! this._updater) {
        this._updater = this._collection.createUpdater();
    }
    this._annotator = this._updater.createAnnotator();

    this._updater.on('annotationDiff', function () { this.handleAnnotations.apply(this, arguments); }.bind(this));

    this._updater
        .pipe(new FeaturedFilter())
        .pipe(this);

};
inherits(FeaturedUpdater, PassThrough);

FeaturedUpdater.prototype.handleAnnotations = function (contentId, annotations) {
    // Filter out only annotations related to featuring (e.g. featuredmessage)
    var featuredAnnotations = {};
    for (var annotationType in annotations) {
        if (annotations.hasOwnProperty(annotationType)) {
            var annotation = annotations[annotationType];
            if (annotation.featuredmessage) {
                featuredAnnotations[annotationType] = featuredAnnotations[annotationType] || {};
                featuredAnnotations[annotationType].featuredmessage = annotation.featuredmessage;
            }
        }
    }

    if (! Object.keys(featuredAnnotations).length) {
        return;
    }

    var content = Storage.get(contentId);
    // Only handle case where content is not in Storage,
    // as CollectionUpdater already handles that.
    if (! content) {
        this._collection.fetchContent(contentId, function (err, content) {
            if (! content) {
                return;
            }
            this._annotator.annotate(content, featuredAnnotations);
            this.write(content);
        }.bind(this));
    }
};

module.exports = FeaturedUpdater;
