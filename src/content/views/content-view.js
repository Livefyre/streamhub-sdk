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

        // handle oembed loading gracefully
        var self = this;
        var newImg = $(this.el).find('.content-attachments img').last();
        newImg.hide();
        newImg.on('load', function() {
            newImg.fadeIn();
            $(self.el).trigger('imageLoaded');
        });
        newImg.on('error', function() {
            self.content.attachments.pop();
            newImg.remove();
            // todo: (gene) review this line...
            self.render();
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
