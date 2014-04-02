define([
    'streamhub-sdk/storage',
    'streamhub-sdk/util',
    'stream/writable',
    'inherits',
    'streamhub-sdk/jquery'
], function (Storage, util, Writable, inherits, $) {
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
        var content = opts.content || Storage.get(opts.contentId);
        if (!content) {
            return;
        }
        this.annotate(content, opts.annotationDiff, opts.silence);
    };

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

    // featuredmessage

    Annotator.prototype.added.featuredmessage = function (changeSet, annotation) {
        changeSet.featured = annotation;
    };

    Annotator.prototype.updated.featuredmessage = Annotator.prototype.added.featuredmessage;

    Annotator.prototype.removed.featuredmessage = function (changeSet, annotation) {
        changeSet.featured = false;
    };

    // moderator

    Annotator.prototype.added.moderator = function(changeSet) {
        changeSet.moderator = true;
    };

    Annotator.prototype.removed.moderator = function(changeSet) {
        changeSet.moderator = false;
    };

    Annotator.prototype.added.geocode = function (changeSet, annotationValue) {
        changeSet.geocode = annotationValue;

    //likedBy

    Annotator.prototype.added.likedBy = function (changeSet, annotationValue) {
        changeSet.likedBy = annotationValue;
        changeSet._likes = annotationValue.length;
    };

    Annotator.prototype.updated.likedBy = function (changeSet, annotationValue) {
        changeSet.likedBy = annotationValue;
        changeSet._likes = annotationValue.length;
    };

    Annotator.prototype.removed.likedBy = function (changeSet, annotationValue, content) {
        var likes = content.likedBy.slice(0) || [];
        for (var i=0; i < annotationValue.length; i++) {
            likes.splice(likes.indexOf(annotationValue[i]), 1);
        }
        changeSet.likedBy = likes;
        changeSet._likes = likes.length;
    };

    // Content Extensions
    Annotator.prototype.added.extension = function (changeSet, addedExtensions, content) {
        var existingExtensions = content.extensions || {};
        changeSet.extensions = $.extend(existingExtensions, addedExtensions);
    };

    return Annotator;
});
