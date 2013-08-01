define([
    'streamhub-sdk/jquery',
    'hgn!streamhub-sdk/content/templates/content',
    'streamhub-sdk/util'
], function ($, ContentTemplate, Util) {
    
    /**
     * Defines the base class for all content-views. Handles updates to attachments
     * and loading of images.
     * @param opts {Object} The set of options to configure this view with.
     * @param opts.content {Content} The content object to use when rendering. 
     * @param opts.el {?HTMLElement} The element to render this object in.
     * @exports streamhub-sdk/content/views/content-view
     * @constructor
     */
    var ContentView = function ContentView (opts) {
        opts = opts || {};
        this.content = opts.content;
        // store construction time to use for ordering if this.content has no dates
        this.createdAt = new Date();

        if (this.content) {
            var self = this;
            this.content.on("attachment", function(content) {
                self.render();
            });
            this.content.on("reply", function(content) {
                self.render();
            });
        }

        this.template = opts.template || this.template;
        
        this.setElement(opts.el || document.createElement(this.elTag));
    };
    
    ContentView.prototype.elTag = 'article';
    ContentView.prototype.elClass = 'content';
    ContentView.prototype.tooltipElSelector = '.hub-tooltip-link';
    ContentView.prototype.template = ContentTemplate;
    
     /**
     * Set the .el DOMElement that the ContentView should render to
     * @param el {DOMElement} The new element the ContentView should render to
     */
    ContentView.prototype.setElement = function (el) {
        this.el = el;
        this.$el = $(el);
        this.$el.addClass(this.elClass);
        if (this.content && this.content.id) {
            this.$el.attr('data-content-id', this.content.id);
        }
        this.attachHandlers();
        return this;
    };
    
    /**
     * Render the content inside of the ContentView's element.
     */
    ContentView.prototype.render = function () {
        var context = this.getTemplateContext();
        if (this.content.createdAt) {
            context.formattedCreatedAt = Util.formatDate(this.content.createdAt);
        }
        this.el.innerHTML = this.template(context);
        if (this.content.attachments && this.content.attachments.length > 0) {
            this.$el.addClass('content-with-attachments');
        }
        // handle oembed loading gracefully
        var self = this;
        var newImg = $(this.el).find('.content-attachments img').last();
        newImg.hide();
        newImg.on('load', function() {
            newImg.fadeIn();
            self.$el.trigger('imageLoaded');
            self.$el.addClass('content-with-image');
        });
        newImg.on('error', function() {
            self.content.attachments.pop();
            self.$el.find('.content-attachments').empty();
            self.$el.removeClass('content-with-image');
        });

        return this;
    };

    ContentView.prototype.attachHandlers = function () {
        var self = this;
        this.$el.on('mouseenter', this.tooltipElSelector, function (e) {
            var title = $(this).attr('title');
            var position = $(this).position();
            var positionWidth = $(this).width();

            var $currentTooltip = $("<div class=\"hub-current-tooltip content-action-tooltip\"><div class=\"content-action-tooltip-bubble\">" + title + "</div><div class=\"content-action-tooltip-tail\"></div></div>");
            $(this).parent().append($currentTooltip);

            var tooltipOffset = $(this).offset();

            var tooltipWidth = $currentTooltip.outerWidth();
            var tooltipHeight = $currentTooltip.outerHeight();

            console.log(position.left, positionWidth, tooltipWidth);
            $currentTooltip.css({
                "left": position.left + (positionWidth / 2) - (tooltipWidth / 2) + 5,
                "top":  position.top - tooltipHeight - 2
            });

            if ($(this).hasClass(self.tooltipElSelector)){
                var currentLeft = parseInt($currentTooltip.css('left'));
                $currentTooltip.css('left', currentLeft + 7);
            }

            $currentTooltip.fadeIn();
        });
        this.$el.on('mouseleave', this.tooltipElSelector, function (e) {
            var $current = self.$el.find('.hub-current-tooltip');
            $current.removeClass('hub-current-tooltip').fadeOut(200, function(){
                $(this).remove();
            });
        });
        return this;
    };
    
    /**
     * Gets the template rendering context. By default, returns "this.content".
     * @return {Content} The content object this view was instantiated with.
     */  
    ContentView.prototype.getTemplateContext = function () {
        var context = $.extend({}, this.content);
        context.renderAttachment = this.renderAttachment;
        return context;
    };

    ContentView.prototype.renderAttachment = function () {
        var linkHtml;
        switch (this.type) {
            case 'photo':
                return '<img src="{url}" />'.replace('{url}', this.url);
            case 'video':
                return this.html;
            case 'link':
                /** @todo show thumbnails */
                linkHtml = '<a href="{href}">{body}</a>'
                    .replace("{href}", this.url)
                    .replace("{body}", linkAttachmentBody(this));
                return linkHtml;
            case 'rich':
                return this.html;
            default:
                return '';
        }
    };

    function linkAttachmentBody (oembed) {
        var body = oembed.title;
        if (oembed.thumbnail_url) {
            body = '<img src="'+oembed.thumbnail_url+'" />';
        }
        return body;
    }
    
    return ContentView;
});
