var $ = require('streamhub-sdk/jquery');
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

    this._content = opts.content;
};
inherits(ContentBodyView, View);

ContentBodyView.prototype.events = View.prototype.events.extended({
    'click.content-body-show-more': function(e) {
        e.stopPropagation();
        this._showMore();
    }
});

ContentBodyView.prototype.template = template;
ContentBodyView.prototype.elTag = 'section';
ContentBodyView.prototype.elClass = 'content-body';
ContentBodyView.prototype.showMoreSelector = '.content-body-show-more';

ContentBodyView.prototype.getTemplateContext = function (opts) {
    var context = $.extend({}, this._content);
    var attachments = context.attachments;

    // Ensure that content.body has a p tag
    var div = document.createElement('div');
    div.innerHTML = context.body;
    var bodyText = div.innerText;
    context.truncated = false;
    if (bodyText.length > 125 && (!opts || (opts && opts.showMore !== true))){
        bodyText = bodyText.slice(0, 124) + '...';
        context.truncated = true;
    } 
    context.body = '<p>'+bodyText+'</p>';

    // If there an duplicate link title + content title, then
    // remove the content title for display purposes.
    if (attachments.length && attachments[0].type === 'link') {
        if (context.title === attachments[0].title) {
            context.title = '';
        }
    }

    context.showMoreText = 'View More';

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

ContentBodyView.prototype._showMore = function () {
    this.render({showMore:true});
}

/** @override */
ContentBodyView.prototype.render = function (opts) {
    var context;
    if (typeof this.template === 'function') {
        context = this.getTemplateContext(opts);
        this.$el.html(this.template(context));
    }

    if (this._content.title) {
        this.$el.addClass('content-has-title');
    }

    /*if (this.showMoreEl && this.showMoreEl.length > 0) { 
        this.showMoreEl.off('click', '*');
    }

    this.showMoreEl = this.$el.find(this.showMoreSelector);
    if (this.showMoreEl.length > 0) {
        this.showMoreEl.on('click', this._showMore.bind(this));
    }*/
};

ContentBodyView.prototype.destroy = function () {
    View.prototype.destroy();
}

module.exports = ContentBodyView;
