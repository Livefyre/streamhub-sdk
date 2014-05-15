define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/view',
    'hgn!streamhub-sdk/content/templates/content',
    'streamhub-sdk/util',
    'inherits',
    'streamhub-sdk/debug'
], function ($, View, ContentTemplate, util, inherits, debug) {
    'use strict';

    var log = debug('streamhub-sdk/content/views/content-view');

    /**
     * Defines the base class for all content-views. Handles updates to attachments
     * and loading of images.
     *
     * @param opts {Object} The set of options to configure this view with.
     * @param opts.content {Content} The content object to use when rendering. 
     * @param opts.el {?HTMLElement} The element to render this object in.
     * @fires ContentView#removeContentView.hub
     * @exports streamhub-sdk/content/views/content-view
     * @constructor
     */
    var ContentView = function ContentView (opts) {
        opts = opts || {};
        
        this.content = opts.content;
        if (this.content) {
            this.content.view = this;
        }
        // store construction time to use for ordering if this.content has no dates
        this.createdAt = new Date();
        this.template = opts.template || this.template;
        this.attachmentsView = opts.attachmentsView;
        this._controls = {
            'left': [],
            'right': []
        };

        View.call(this, opts);

        if (this.content) {
            this.content.on("reply", function(content) {
                this.render();
            }.bind(this));
            this.content.on("change:visibility", function(newVis, oldVis) {
                this._handleVisibilityChange(newVis, oldVis);
            }.bind(this));
            // TODO: Re-render on change.
            // Removed for now because re-rendering a ContentView and
            // AttachmentsListView can unbind handlers important for modal
        }
    };
    inherits(ContentView, View);
    
    ContentView.prototype.elTag = 'article';
    ContentView.prototype.elClass = 'content';
    ContentView.prototype.contentWithImageClass = 'content-with-image';
    ContentView.prototype.imageLoadingClass = 'hub-content-image-loading';
    ContentView.prototype.tooltipElSelector = '.hub-tooltip-link';
    ContentView.prototype.attachmentsElSelector = '.content-attachments';
    ContentView.prototype.tiledAttachmentsElSelector = '.content-attachments-tiled';
    ContentView.prototype.headerElSelector = '.content-header';
    ContentView.prototype.avatarSelector = '.content-author-avatar';
    ContentView.prototype.attachmentFrameElSelector = '.content-attachment-frame';
    ContentView.prototype.footerLeftSelector = '.content-footer-left > .content-control-list';
    ContentView.prototype.template = ContentTemplate;
    ContentView.prototype.formatDate = util.formatDate;

    ContentView.prototype.events = View.prototype.events.extended({
        'imageLoaded.hub': function(e) {
            this.$el.addClass(this.contentWithImageClass);
            this.$el.removeClass(this.imageLoadingClass);

            e.stopPropagation();
            this.$el.parent().trigger('imageLoaded.hub', { contentView: this });
        },
        'imageError.hub': function(e, oembed) {
            this.content.removeAttachment(oembed);

            if (this.attachmentsView && this.attachmentsView.tileableCount && !this.attachmentsView.tileableCount()) {
                this.$el.removeClass(this.contentWithImageClass);
                this.$el.removeClass(this.imageLoadingClass);
            }

            e.stopPropagation();
            this.$el.parent().trigger('imageError.hub', { oembed: oembed, contentView: this });
        }
    }, function (events) {
        events['click ' + this.headerElSelector] = function(e) {
            if (! this.$el.hasClass(this.contentWithImageClass)) {
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

        events['mouseenter ' + this.tooltipElSelector] = function (e) {
            var target = e.target;
            var title = $(target).attr('title');
            var position = $(target).position();
            var positionWidth = $(target).width();

            var $currentTooltip = $("<div class=\"hub-current-tooltip content-action-tooltip\"><div class=\"content-action-tooltip-bubble\">" + title + "</div><div class=\"content-action-tooltip-tail\"></div></div>");
            $(target).parent().append($currentTooltip);

            var tooltipWidth = $currentTooltip.outerWidth();
            var tooltipHeight = $currentTooltip.outerHeight();

            $currentTooltip.css({
                "left": position.left + (positionWidth / 2) - (tooltipWidth / 2),
                "top":  position.top - tooltipHeight - 2
            });

            if ($(target).hasClass(this.tooltipElSelector)){
                var currentLeft = parseInt($currentTooltip.css('left'), 10);
                $currentTooltip.css('left', currentLeft + 7);
            }

            $currentTooltip.fadeIn();
        };
        events['mouseleave ' + this.tooltipElSelector] = function (e) {
            var $current = this.$el.find('.hub-current-tooltip');
            $current.removeClass('hub-current-tooltip').fadeOut(200, function(){
                $current.remove();
            });
        };
    });

     /**
     * Set the .el DOMElement that the ContentView should render to
     * @param el {DOMElement} The new element the ContentView should render to
     * @returns {ContentView}
     */
    ContentView.prototype.setElement = function (el) {
        View.prototype.setElement.apply(this, arguments);

        if (this.attachmentsView && this.attachmentsView.tileableCount && this.attachmentsView.tileableCount()) {
            this.$el.addClass(this.imageLoadingClass);
        }

        if (this.content && this.content.id) {
            this.$el.attr('data-content-id', this.content.id);
        }
        this.attachHandlers();

        return this;
    };
    
    /**
     * Render the content inside of the ContentView's element.
     * @returns {ContentView}
     */
    ContentView.prototype.render = function () {
        var context = this.getTemplateContext();
        if (this.content.createdAt) {
            context.formattedCreatedAt = this.formatDate(this.content.createdAt);
        }
        this.el.innerHTML = this.template(context);

        // If avatar fails to load, hide it
        // Error events don't bubble, so we have to bind here
        // http://bit.ly/JWp86R
        this.$(this.avatarSelector+' img')
            .on('error', $.proxy(this._handleAvatarError, this));

        if (this.attachmentsView) {
            this.attachmentsView.setElement(this.$el.find(this.attachmentsElSelector)[0]);
            this.attachmentsView.render();
        }

        return this;
    };
    
    /**
     * Binds event handlers on this.el
     * This is deprecated now that View provides .delegateEvents, but retained
     * in v2 for public interface consistency
     * It should be removed in v3
     * @deprecated
     * @returns {ContentView}
     */
    ContentView.prototype.attachHandlers = function () {
        return this;
    };
    
    /**
     * Gets the template rendering context. By default, returns "this.content".
     * @returns {Content} The content object this view was instantiated with.
     */
    ContentView.prototype.getTemplateContext = function () {
        var context = $.extend({}, this.content);
        // Ensure that content.body has a p tag
        var isHtml = /^\s*<(p|div)/;
        if ( ! isHtml.test(context.body)) {
            context.body = '<p>'+context.body+'</p>';
        }
        return context;
    };

    /**
     * Removes the content view element, and triggers 'removeContentView.hub'
     * event for the instance to be removed from its associated ListView.
     */
    ContentView.prototype.remove = function() {
        /**
         * removeContentView.hub
         * @event ContentView#removeContentView.hub
         * @type {{contentView: ContentView}}
         */
        this.$el.trigger('removeContentView.hub', { contentView: this });
        this.$el.detach();
    };

    /**
     * Handles changes to the model's visibility.
     * @param ev
     * @param oldVis {string} Content.enum.visibility
     * @param newVis {string} Content.enum.visibility
     */
    ContentView.prototype._handleVisibilityChange = function(newVis, oldVis) {
        if (newVis !== 'EVERYONE') {
            this.remove();
        }
    };

    /**
     * Handle an error loading the avatar by removing the avatar element
     * @private
     */
    ContentView.prototype._handleAvatarError = function (e) {
        log('avatar error, hiding it', e);
        this.$(this.avatarSelector).remove();
    };

    ContentView.prototype.destroy = function () {
        View.prototype.destroy.call(this);
        this.content = null;
    };

    ContentView.prototype.addButton = function (button) {
        this._controls.left.push(button);

        var footerLeft = this.$el.find(this.footerLeftSelector);
        var buttonContainerEl = $('<div></div>');
        footerLeft.append(buttonContainerEl);

        button.setElement(buttonContainerEl);
        button.render();
    };

    ContentView.prototype.removeButton = function (button) {
        button.destroy();
    };
    
    return ContentView;
});
