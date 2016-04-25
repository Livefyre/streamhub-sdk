var $ = require('streamhub-sdk/jquery');
var inherits = require('inherits');
var View = require('streamhub-sdk/view');
var template = require('hgn!streamhub-sdk/content/templates/content-body');
var ActivityTypes = require('activity-streams-vocabulary').ActivityTypes;
var ObjectTypes = require('activity-streams-vocabulary').ObjectTypes;

'use strict';

/**
 * A view that displays a content item's body
 * @param opts {Object} A set of options to config the view with
 * @param opts.el {HTMLElement} The element in which to render the streamed content
 * @param opts.content {Content} The content instance with which to display its body
 * @exports streamhub-sdk/views/content-body-view
 * @constructor
 */
var ContentBodyView = function (opts) {
    opts = opts || {};
    View.call(this, opts);

    this._content = opts.content;
};
inherits(ContentBodyView, View);

ContentBodyView.prototype.template = template;
ContentBodyView.prototype.elTag = 'section';
ContentBodyView.prototype.elClass = 'content-body';

/**
 * @extend
 */
ContentBodyView.prototype.events = View.prototype.events.extended({
    'click': function (evt) {
        var evtTarget = evt.target;

        // This takes care of the case if someone wraps an additional tag around
        // the HTML we render, like <strong>, <span>, etc. (e.g. Youtube), which
        // ends up slightly throwing off what the triggered event target is.
        // That said, no big deal.. typically it's parent is an anchor element.
        if (evtTarget.nodeName.toLowerCase() !== 'a' &&
            evtTarget.parentNode.nodeName.toLowerCase() === 'a') {
            evtTarget = evtTarget.parentNode;
        }

        if (evtTarget.nodeName.toLowerCase() === 'a') {
            $(evtTarget).trigger('insights:local', {
                type: ActivityTypes.CLICK_THROUGH,
                content: {
                    href: evtTarget.href || '',
                    type: ObjectTypes.LINK
                }
            });
        }
    }
});

ContentBodyView.prototype.getTemplateContext = function () {
    var context = $.extend({}, this._content);
    // Ensure that content.body has a p tag
    var isHtml = /^\s*<(p|div)/;
    if ( ! isHtml.test(context.body)) {
        context.body = '<p>'+context.body+'</p>';
    }
    return context;
};

module.exports = ContentBodyView;
