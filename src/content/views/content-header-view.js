var $ = require('streamhub-sdk/jquery');
var debug = require('debug');
var inherits = require('inherits');
var properCase = require('mout/string/properCase');
var template = require('hgn!streamhub-sdk/content/templates/content-header');
var util = require('streamhub-sdk/util');
var View = require('streamhub-sdk/view');

var log = debug('streamhub-sdk/content/views/content-header-view');

'use strict';

/**
 * A view that displays a content item's header.
 * Includes the avatar, content byline, and source-type logo
 * @param opts {Object} A set of options to config the view with
 * @param opts.el {HTMLElement} The element in which to render the streamed content
 * @param opts.content {Content} The content instance with which to display its header
 * @exports streamhub-sdk/views/content-header-view
 * @constructor
 */
var ContentHeaderView = function (opts) {
    opts = opts || {};
    View.call(this, opts);

    this.author = opts.author;
    this.authorUserNamePrefix = opts.authorUserNamePrefix;
    this.authorUserName = opts.authorUserName;
    this.authorUrl = opts.authorUrl;
    this.authorVerified = opts.authorVerified;
    this.contentSourceName = opts.contentSourceName;
    this.contentSourceUrl = opts.contentSourceUrl;
    this.contentSourceTooltipText = opts.contentSourceTooltipText;
};
inherits(ContentHeaderView, View);

ContentHeaderView.prototype.template = template;
ContentHeaderView.prototype.elTag = 'section';
ContentHeaderView.prototype.elClass = 'content-header';

ContentHeaderView.prototype.headerElSelector = '.content-header';
ContentHeaderView.prototype.innerSelector = '.content-header-inner';
ContentHeaderView.prototype.avatarClass = 'content-author-avatar';
ContentHeaderView.prototype.hasAvatarClass = 'has-avatar';
ContentHeaderView.prototype.sourceIconElSelector = '.content-source-logo';
ContentHeaderView.prototype.authorNameElSelector = '.content-author-name';
ContentHeaderView.prototype.authorUserNameElSelector = '.content-author-username';
ContentHeaderView.prototype.avatarSelector = '.'+ContentHeaderView.prototype.avatarClass;
ContentHeaderView.prototype.contentWithImageClass = 'content-with-image';
ContentHeaderView.prototype.parentClassSelector = '.content';

ContentHeaderView.prototype.events = View.prototype.events.extended({}, function (events) {
    events['click'] = function(e) {
        if (! this.$el.parents(this.parentClassSelector).hasClass(this.contentWithImageClass) ||
            $(e.target).parent().hasClass(this.avatarClass)) {
            // Only do this when there is an image
            return;
        }
        var headerEl = $(e.currentTarget);
        var frameEl = this.$el.find('.content-attachments-tiled ' + this.attachmentFrameElSelector);

        headerEl.hide();
        frameEl.hide();
        var targetEl = document.elementFromPoint(e.clientX, e.clientY);
        frameEl.show();
        headerEl.show();

        $(targetEl).trigger('click');
    };
});

ContentHeaderView.prototype.render = function () {
    View.prototype.render.call(this);

    // If avatar fails to load, hide it
    // Error events don't bubble, so we have to bind here
    // http://bit.ly/JWp86R
    this.$(this.avatarSelector+' img')
        .on('error', $.proxy(this._handleAvatarError, this));

    // inline the source icon position so we don't have to set tab-index for all content
    util.raf($.proxy(this.positionSourceIcon, this));
};

ContentHeaderView.prototype.positionSourceIcon = function () {
    var nameHeight = this.$(this.authorNameElSelector).height() || 0;
    var userNameHeight = this.$(this.authorUserNameElSelector).height() || 0;
    this.$(this.sourceIconElSelector).css('top', '-' + (nameHeight + userNameHeight) + 'px');
};

/**
 * Handle an error loading the avatar by removing the avatar element
 * @private
 */
ContentHeaderView.prototype._handleAvatarError = function (e) {
    log('avatar error, hiding it', e);
    this.$(this.avatarSelector).remove();
    this.$el.find(this.innerSelector).removeClass(this.hasAvatarClass);
};

ContentHeaderView.prototype.getTemplateContext = function () {
    var context = $.extend({}, this);
    context.authorAvatarUrl = this.author ? this.author.profileUrl : undefined;
    // Falling back to `false` because mustache doesn't think "" is falsy...
    context.authorUrl = (context.authorUrl ? context.authorUrl : context.authorAvatarUrl) || false;
    context.authorUrlLabel = [
        context.author.displayName + '\'s',
        properCase(this.opts.contentSourceName),
        'profile'
    ].join(' ');
    return context;
};

module.exports = ContentHeaderView;
