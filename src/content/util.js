define([], function () {
    'use strict';

    var util = {};

    /**
     * Anchor html tag regex.
     * @type {RegExp}
     */
    var ANCHOR_REGEX = /(<a(?:(?!<\/a>).)*<\/a>)/ig;

    /**
     * URL regex.
     * @type {RegExp}
     */
    var URL_REGEX = /(https?:\/\/[a-z0-9\.\=\?\/\-\&\_\#\%]*)/i;

    /**
     * Determines if the provided index is within an anchor element in the
     * provided html string.
     * @param {string} str The html string to look in.
     * @param {number} index The index to compare.
     * @return {boolean} Whether the index is within an anchor or not.
     */
    util.inAnchor = function (str, index) {
        ANCHOR_REGEX.lastIndex = 0;
        var match;
        while (match = ANCHOR_REGEX.exec(str)) {
            if (match.index < index && index < ANCHOR_REGEX.lastIndex) {
                return { startIndex: match.index, endIndex: ANCHOR_REGEX.lastIndex };
            }
        }
        return null;
    };

    /**
     * Linkify a string.
     * @param {string} str The string to linkify.
     * @return {string} The linkified string.
     */
    util.linkify = function (str) {
        var match = URL_REGEX.exec(str);

        if (!match) {
            return str;
        }

        var anchor = util.inAnchor(str, match.index);
        var link = '';

        // The index at which the beginning substring ends.
        var endOfBeginningSub;

        // The index at which the remainder substring starts.
        var startOfRemainingSub;

        // If the match is within an anchor, the end of the beginning substring
        // should be the end of the matching anchor, so that we don't try to
        // process this anchor again. The remainder substring should also start
        // with the end of the matching anchor, so the rest of the string gets
        // processed.
        if (anchor) {
            endOfBeginningSub = anchor.endIndex;
            startOfRemainingSub = anchor.endIndex;
        }

        // If the match is not within an anchor, the end of the beginning
        // substring should be the matched index, so that we can remove the
        // url and add in the html link. The remainder should be the matched
        // index + the length of the url, so that we are removing only the url.
        // The link will also be set to the html anchor tag.
        else {
            endOfBeginningSub = match.index;
            startOfRemainingSub = match.index + match[0].length;
            link = '<a href="' + match[0] + '" target="_blank" rel="nofollow">' + match[0] + '</a>';
        }

        // Concatenate the different pieces together, while using recursion on
        // the remainding portion of the string. This is how the whole string
        // is processed.
        var beginningStr = str.substring(0, endOfBeginningSub);
        var endingStr = str.substring(startOfRemainingSub);
        return beginningStr + link + util.linkify(endingStr);
    };

    return util;
});
