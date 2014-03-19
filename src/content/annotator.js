define([
    'streamhub-sdk/storage',
    'stream/writable',
    'inherits',
    'streamhub-sdk/jquery'
], function (Storage, Writable, inherits, $) {
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
            if ( ! Object.keys(annotations).length) {
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

    // Content Extensions
    Annotator.prototype.added.extension = function (changeSet, addedExtensions, content) {
        var existingExtensions = content.extensions || {};
        changeSet.extensions = $.extend(existingExtensions, addedExtensions);
    };
    Annotator.prototype.updated.extension = function (changeSet, annotation, content) {
        changeSet.extensions = annotation;
    };
    Annotator.prototype.removed.extension = function (changeSet, annotation, content) {
        var extensions = content.extensions || {};
        Object.keys(annotation).forEach(function (extensionName) {
            if (extensions.hasOwnProperty(extensionName)) {
                delete extensions[extensionName];
            }
        });
        changeSet.extensions = extensions;
    };

    return Annotator;
});
