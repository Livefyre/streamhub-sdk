/**
 * @fileoverview Dom helpers that are generally unsupported or too specific for jQuery
 */

var UserAgentUtil = require('streamhub-sdk/user-agent');

/** @type {Object} */
var dom = {};

/**
 * Returns a text rectangle object that encloses a group of text rectangles.
 * @return {Object}
 */
dom.getBoundingClientRect = function (elem) {
    var rect = elem.getBoundingClientRect();
    // Sometimes IE has a problem getting this value for the first time. When
    // this happens, all of the data attributes are 0. It always seems to work
    // the second time, even if it's immediately after.
    if (!rect.height && !rect.top) {
        rect = elem.getBoundingClientRect();
    }
    // Rect object doesn't contain height or width, so we get to generate it!
    if (UserAgentUtil.isIE() && UserAgentUtil.getIEVersion() < 9) {
        rect = {top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left};
        rect.height = rect.bottom - rect.top;
        rect.width = rect.right - rect.left;
    }
    return rect;
};

/**
 * Get the scroll x position within the window. This needs it's own function
 * for browser compatibility.
 * @return {number}
 */
dom.getScrollX = function () {
    if (window.pageXOffset !== undefined) {
        return window.pageXOffset;
    }
    return (document.documentElement || document.body.parentNode || document.body).scrollLeft;
};

/**
 * Get the scroll y position within the window. This needs it's own function
 * for browser compatibility.
 * @return {number}
 */
dom.getScrollY = function () {
    if (window.pageYOffset !== undefined) {
        return window.pageYOffset;
    }
    return (document.documentElement || document.body.parentNode || document.body).scrollTop;
};

module.exports = dom;
