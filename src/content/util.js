define([
    'linkify/linkify-html'],
function (linkifyHtml) {
    'use strict';

    var util = {};

    /**
     * Linkify a string.
     * @param {string} str The string to linkify.
     * @return {string} The linkified string.
     */
    util.linkify = function (str) {
        try {
            var linkified = linkifyHtml(str, {
                linkAttributes: {
                    rel: 'nofollow'
                }
            });
        } catch (e) {
            return str;
        }
        
        return linkified.replace(/ class="linkified"/ig, '');
    };

    return util;
});
