define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/view',
    'streamhub-sdk/content/views/oembed-view',
    'hgn!streamhub-sdk/content/templates/attachment-list',
    'streamhub-sdk/util'],
function($, View, OembedView, AttachmentListTemplate, util) {
    
    /**
     * A simple View that displays Content in a list (`<ul>` by default).
     * @param opts {Object} A set of options to config the view with
     * @param opts.el {HTMLElement} The element in which to render the streamed content
     * @param opts.content {Content} The content instance with which to display its attachments
     * @exports streamhub-sdk/views/attachment-list-view
     * @constructor
     */
    var AttachmentListView = function(opts) {
        opts = opts || {};
        this.oembedViews = [];
        this.setContent(opts.content);
        View.call(this, opts);
    };
    util.inherits(AttachmentListView, View);

    AttachmentListView.prototype.template = AttachmentListTemplate;
    AttachmentListView.prototype.stackedAttachmentsSelector = '.content-attachments-stacked';
    AttachmentListView.prototype.contentAttachmentSelector = '.content-attachment';

    /**
     * Set the element for the view to render in.
     * You will probably want to call .render() after this, but not always.
     * @param content {HTMLElement} The element to render this View in
     */
    AttachmentListView.prototype.setContent = function (content) {
        if (! content) {
            return;
        }
        var self = this;
        if (this.content) {
            // Remove existing attachment views
            this.$el.find(this.contentAttachmentSelector).remove();
            this.oembedViews = [];
        }
        this.content = content;
        for (var i=0; i < this.content.attachments.length; i++) {
            this._insert(this.content.attachments[i]);
        }

        this.content.on('attachment', function (attachment) {
            self.add(attachment);
        });
        this.content.on('removeAttachment', function (attachment) {
            self.remove(attachment);
        });
    };

    /**
     * Set the element for the view to render in.
     * You will probably want to call .render() after this, but not always.
     * @param element {HTMLElement} The element to render this View in
     * @returns this
     */
    AttachmentListView.prototype.setElement = function (element) {
        this.el = element;
        this.$el = $(element);
        return this;
    };

    /**
     * A count of the number of attachments for this content item
     * @returns {int} The number of attachments for this content item
     */
    AttachmentListView.prototype.count = function () {
        return this.oembedViews.length;
    };

    /**
     * Appends a new OembedView given an Oembed instance to the view
     * @param oembed {Oembed} A Oembed instance to insert into the view
     * @returns {OembedView} The OembedView associated with the newly inserted oembed
     */
    AttachmentListView.prototype._insert = function (oembed) {
        var oembedView = this.createOembedView(oembed);
        this.oembedViews.push(oembedView);
        return oembedView;
    };

    /**
     * Add a Oembed attachment to the Attachments view. 
     * @param oembed {Oembed} A Oembed instance to render in the View
     * @returns {AttachmentListView} By convention, return this instance for chaining
     */
    AttachmentListView.prototype.add = function(oembed) {
        var oembedView = this._insert(oembed);
        oembedView.$el.appendTo(this.$el.find(this.stackedAttachmentsSelector));
        oembedView.render();
        return this;
    };

    /**
     * Remove a piece of Content from this ListView
     * @param content {Content} The Content to be removed
     * @returns {boolean} true if Content was removed, else false
     */
    AttachmentListView.prototype.remove = function (oembed) {
        var oembedView = this.getOembedView(oembed);
        if (! oembedView) {
            return false;
        }
        oembedView.$el.remove();
        // Remove from this.oembedViews[]
        this.oembedViews.splice(this.oembedViews.indexOf(oembedView), 1);
        return true;
    };

    /**
     * Creates the view to render the oembed content object
     * @param oembed {Oembed} A Oembed instance to render in the View
     * @returns {OembedView} 
     */
    AttachmentListView.prototype.createOembedView = function(oembed) {
        var oembedView = new OembedView({
            oembed: oembed     
        });
        return oembedView;
    };

    /**
     * Given a new Content instance, return an existing contentView that
     * should be used to update the content (based on identity or content.id).
     * @param newOembed {Content} The piece of content to find the view for.
     * @returns {OembedView | null} The oembedView for the content, or null.
     */
    AttachmentListView.prototype.getOembedView = function (newOembed) {
        var existingOembedView;
        for (var i=0; i < this.oembedViews.length; i++) {
            var oembedView = this.oembedViews[i];
            if ((newOembed === oembedView.oembed) || (newOembed.id && oembedView.oembed.id === newOembed.id)) {
                return oembedView;
            }
        }
        return null;
    };

    return AttachmentListView;
});
