define([
    'streamhub-sdk/modal',
    'streamhub-sdk/content/views/gallery-attachment-list-view',
    'inherits'
], function(ModalView, GalleryAttachmentListView, inherits) {
    'use strict';

    /**
     * A view that overlays over the entire viewport to display some content
     *
     * @param opts {Object} A set of options to config the view with
     * @fires AttachmentGalleryModal#hideModal.hub
     * @exports streamhub-sdk/modal/views/attachment-gallery-modal
     * @constructor
     */
    var AttachmentGalleryModal = function (opts) {
        ModalView.call(this, opts);
    };
    inherits(AttachmentGalleryModal, ModalView);


    /**
     * Creates a the content view to display within the modal view
     * @param content {Content} The content to be displayed in the content view by the modal
     * @param opts {Object} The content to be displayed in the content view by the modal
     * @param opts.attachment {Oembed} The attachment to be focused in the content view
     * @private
     */
    AttachmentGalleryModal.prototype._createContentView = function (content, opts) {
        opts = opts || {};
        var modalContentView = new GalleryAttachmentListView({
            content: content,
            attachmentToFocus: opts.attachment
        });
        return modalContentView;
    };


    /**
     * @private
     * Set the element for the view to render in.
     * ModalView construction takes care of creating its own element in
     *     ModalView.el. You probably don't want to call this manually
     * @param element {HTMLElement} The element to render this View in
     * @returns this
     */
    AttachmentGalleryModal.prototype.setElement = function (element) {
        ModalView.prototype.setElement.call(this, element);

        var self = this;
        this.$el.on('galleryResize.hub', function (e) {
            self.resizeFocusedAttachment();
        });

        return this;
    };


    /**
     * Resizes the focused attachment according to the viewport size
     */
    AttachmentGalleryModal.prototype.resizeFocusedAttachment = function () {
        var height = this.$el.height();
        var width = this.$el.width();

        var contentGalleryEl = this.$el.find(GalleryAttachmentListView.prototype.attachmentsGallerySelector);
        var modalVerticalWhitespace = parseInt(contentGalleryEl.css('margin-top'), 10) + parseInt(contentGalleryEl.css('margin-bottom'), 10);
        var modalHorizontalWhitespace = parseInt(contentGalleryEl.css('margin-left'), 10) + parseInt(contentGalleryEl.css('margin-right'), 10);

        var attachmentContainerHeight = height - modalVerticalWhitespace;
        var attachmentContainerWidth = width - modalHorizontalWhitespace;
        contentGalleryEl.height(attachmentContainerHeight);
        contentGalleryEl.width(attachmentContainerWidth);

        var contentAttachmentEl = this.$el.find(GalleryAttachmentListView.prototype.focusedAttachmentsSelector + ' .content-attachment');
        contentAttachmentEl.css({ 'height': Math.min(attachmentContainerHeight, attachmentContainerWidth)+'px', 'line-height': attachmentContainerHeight+'px'});

        var focusedAttachmentEl = this.$el.find('.'+GalleryAttachmentListView.prototype.focusedAttachmentClassName + '> *');
        // Reset attachment dimensions
        if (focusedAttachmentEl.attr('width')) {
            focusedAttachmentEl.css({ 'width': parseInt(focusedAttachmentEl.attr('width'), 10)+'px' });
        } else {
            focusedAttachmentEl.css({ 'width': 'auto'});
        }
        if (focusedAttachmentEl.attr('height')) {
            focusedAttachmentEl.css({ 'height': parseInt(focusedAttachmentEl.attr('height'), 10)+'px' });
        } else {
            focusedAttachmentEl.css({ 'height': 'auto', 'line-height': 'inherits'});
        }

        // Scale to fit testing against modal dimensions
        if (focusedAttachmentEl.height() + modalVerticalWhitespace >= height || focusedAttachmentEl.height() === 0) {
            focusedAttachmentEl.css({ 'height': Math.min(attachmentContainerHeight, attachmentContainerWidth)+'px', 'line-height': Math.min(attachmentContainerHeight, attachmentContainerWidth)+'px'});
            if (focusedAttachmentEl.attr('width')) {
                var newWidth = Math.min(parseInt(focusedAttachmentEl.attr('width'), 10), focusedAttachmentEl.width());
                focusedAttachmentEl.css({ 'width': newWidth+'px' });
            } else {
                focusedAttachmentEl.css({ 'width': 'auto' });
            }
        }

        if (focusedAttachmentEl.width() + modalHorizontalWhitespace >= width || focusedAttachmentEl.width() === 0) {
            focusedAttachmentEl.css({ 'width': attachmentContainerWidth+'px'});
            if (focusedAttachmentEl.attr('height')) {
                var newHeight = Math.min(parseInt(focusedAttachmentEl.attr('height'), 10), focusedAttachmentEl.height());
                focusedAttachmentEl.css({ 'height': newHeight+'px' });
            } else {
                focusedAttachmentEl.css({ 'height': 'auto', 'line-height': 'inherits'});
            }
        }
    };


    return AttachmentGalleryModal;
});
