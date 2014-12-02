define([
    'streamhub-sdk/storage',
    'streamhub-sdk/util',
    'stream/writable',
    'inherits'
], function (Storage, util, Writable, inherits) {
    'use strict';

    /**
     * An Object that updates Content when changes are streamed.
     */
    var Annotator = function (opts) {
        opts = opts || {};
        Writable.call(this, opts);
    };

    inherits(Annotator, Writable);

    /**
     * @param content {Content}
     * @param annotationDiff {object} A set of 'added', 'updated', and 'removed' annotations.
     * @param silence [boolean] Mute any events that would be fired
     */
    Annotator.prototype.annotate = function (content, annotationDiff, silence) {
        var annotation;
        var annotations;
        var annotationType;
        var changeSet = {};
        var handleFunc;
        var verb;

        for (verb in annotationDiff) {
            if ( ! annotationDiff.hasOwnProperty(verb)) {
                continue;
            }
            annotations = annotationDiff[verb];
            if ( ! util.objectKeys(annotations).length) {
                continue;
            }

            for (annotationType in annotations) {
                if ( ! annotations.hasOwnProperty(annotationType)) {
                    continue;
                }
                annotation = annotations[annotationType];
                handleFunc = this[verb][annotationType];
                handleFunc && handleFunc(changeSet, annotation, content);
            }
        }

        content.set(changeSet, silence);
    };

    /**
     * @param opts {object}
     * @param opts.contentId [string]
     * @param opts.content {Content}
     * @param opts.annotationDiff {object} A set of 'added', 'updated', and 'removed' annotations.
     * @param opts.silence [boolean] Mute any events that would be fired
     */
    Annotator.prototype._write = function(opts) {
        var collection = collectionFromAnnotationDiff(opts.annotationDiff);
        var contentStorageKey = collection && Storage.keys.content({
            id: opts.contentId,
            collection: collection
        });
        var content = opts.content || (contentStorageKey ? Storage.get(contentStorageKey) : null);
        if (! content) {
            return;
        }
        this.annotate(content, opts.annotationDiff, opts.silence);
    };

    function collectionFromAnnotationDiff(annotationDiff) {
        try {
            return {
                id: annotationDiff.added.featuredmessage.rel_collectionId
            }
        } catch (e) {
            // expected because of big dot access chain in try{}
        }
        return;
    }

    /**
     * AnnotationTypes
     * featuredmessage
     * moderator
     */

    /**
     * AnnotationVerbs
     */
    Annotator.prototype.added = {};
    Annotator.prototype.updated = {};
    Annotator.prototype.removed = {};

    // likedBy
    Annotator.prototype.added.likedBy = function (changeSet, annotation, content) {
        var likes = content.likedBy.splice(0);
        for (var i=0; i < annotation.length; i++) {
            var a = annotation[i]
            if (likes.indexOf(a) < 0){
                likes.push(a);
            }
        }
        changeSet.likedBy = likes;
    };

    Annotator.prototype.updated.likedBy = Annotator.prototype.added.likedBy;

    Annotator.prototype.removed.likedBy = function (changeSet, annotation, content) {
        var likes = content.likedBy.splice(0);
        for (var i=0; i < annotation.length; i++) {
            likes.splice(likes.indexOf(annotation[i]), 1);
        }
        changeSet.likedBy = likes;
    };

    // featuredmessage

    Annotator.prototype.added.featuredmessage = function (changeSet, annotation) {
        changeSet.featured = annotation;
    };

    Annotator.prototype.updated.featuredmessage = Annotator.prototype.added.featuredmessage;

    Annotator.prototype.removed.featuredmessage = function (changeSet, annotation, content) {
        changeSet.featured = false;
    };

    // sort order

    Annotator.prototype.added.sortOrder = function (changeSet, annotation) {
        changeSet.sortOrder = annotation;
    };

    Annotator.prototype.updated.sortOrder = Annotator.prototype.added.sortOrder;

    Annotator.prototype.removed.sortOrder = function (changeSet, annotation, content) {
        changeSet.sortOrder = null;
    };

    // moderator - Whether the user who authored the content is a moderator

    Annotator.prototype.added.moderator = function(changeSet) {
        changeSet.moderator = true;
    };

    Annotator.prototype.removed.moderator = function(changeSet) {
        changeSet.moderator = false;
    };

    Annotator.prototype.added.geocode = function (changeSet, annotationValue) {
        changeSet.geocode = annotationValue;
    };

    /**
     * Generator annotations indicate the original source of the content
     * before Livefyre procured it.
     * Inspired by http://activitystrea.ms/specs/json/1.0/#activity
     */
    Annotator.prototype.added.generator = function (changeSet, annotationValue) {
        changeSet.generator = annotationValue;
    }

    return Annotator;
});
