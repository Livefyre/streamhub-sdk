define([
    'streamhub-sdk/storage',
    'stream/writable',
    'inherits'
], function (Storage, Writable, inherits) {
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
     * @param opt_silence [boolean] Mute any events that would be fired
     */
    Annotator.annotate = function (content, annotationDiff, opt_silence) {
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
                handleFunc = Annotator[verb][annotationType];
                handleFunc && handleFunc(changeSet, annotation, content);
            }
        }

        content.set(changeSet, opt_silence);
    };

    /**
     * @param opts {object}
     * @param opts.contentId [string]
     * @param opts.content {Content}
     * @param opts.annotationDiff {object} A set of 'added', 'updated', and 'removed' annotations.
     * @param opts.opt_silence [boolean] Mute any events that would be fired
     */
    Annotator.prototype._write = function(opts) {
        var content = opts.content || Storage.get(opts.contentId);
        if (!content) {
            return;
        }
        Annotator.annotate(content, opts.annotationDiff, opts.opt_silence);
    };

    /**
     * AnnotationTypes
     * featuredmessage
     * moderator
     */

    /**
     * AnnotationVerbs
     */
    Annotator.added = {};
    Annotator.updated = {};
    Annotator.removed = {};

    // featuredmessage

    Annotator.added.featuredmessage = function (changeSet, annotation) {
        changeSet.featured = annotation;
    };

    Annotator.updated.featuredmessage = Annotator.added.featuredmessage;

    Annotator.removed.featuredmessage = function (changeSet, annotation) {
        changeSet.featured = false;
    };

    // moderator

    Annotator.added.moderator = function(changeSet) {
        changeSet.moderator = true;
    };

    Annotator.updated.moderator = Annotator.added.moderator;

    Annotator.removed.moderator = function(changeSet) {
        changeSet.moderator = false;
    };

    return Annotator;
});
