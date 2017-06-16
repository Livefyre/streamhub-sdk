var $ = require('streamhub-sdk/jquery');
var canTruncateBody = require('streamhub-sdk/content/views/mixins/body-truncate-mixin');
var i18n = require('streamhub-sdk/i18n');
var inherits = require('inherits');
var template = require('hgn!streamhub-sdk/content/templates/content-body');
var View = require('streamhub-sdk/view');

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
    canTruncateBody(this, opts);

    this._content = opts.content;
};
inherits(ContentBodyView, View);

ContentBodyView.prototype.template = template;
ContentBodyView.prototype.elTag = 'section';
ContentBodyView.prototype.elClass = 'content-body';

ContentBodyView.prototype.getTemplateContext = function () {
    var context = $.extend({}, this._content);
    var attachments = context.attachments;
    var body = context.bodyOrig || context.body;

    // Ensure that content.body has a p tag
    if (!/^<p/.test($.trim(body))) {
        context.body = '<p>' + $.trim(body) + '</p>';
    }

    // If there an duplicate link title + content title, then
    // remove the content title for display purposes.
    if (attachments.length && attachments[0].type === 'link') {
        if (context.title === attachments[0].title) {
            context.title = '';
        }
    }

    // Ensure that the title is only text.
    if (context.title) {
        var div = document.createElement('div');
        div.innerHTML = context.title;
        context.title = div.innerText;
    }

    // Add the translated featured string if the content is featured
    if (context.featured) {
        context.featuredText = i18n.get('featuredText', 'Featured');
    }
    return context;
};

/** @override */
ContentBodyView.prototype.render = function () {
    View.prototype.render.call(this);

    if (this._content.title) {
        this.$el.addClass('content-has-title');
    }

    return this;
};

module.exports = ContentBodyView;
