var AttachmentGalleryModal = require('streamhub-sdk/modal/views/attachment-gallery-modal');
var GalleryAttachmentListView = require('streamhub-sdk/content/views/gallery-attachment-list-view');

'use strict';

/**
 * A mixin that decorates an instance of View (e.g. ListView, ContentView)
 * to add a event handler for focusContent.hub that displays a modal
 */
function hasAttachmentModal(view, modal) {
    if (modal === undefined || modal === true) {
        modal = new AttachmentGalleryModal();
    }

    view.events = view.events.extended({
        'focusContent.hub': function(e, context) {
            if (! modal) {
                if (view &&
                    view.attachmentsView &&
                    typeof view.attachmentsView.focus === 'function') {
                    view.attachmentsView.focus(context.attachmentToFocus);
                }
            } else {
                var modalSubView = new GalleryAttachmentListView(context);
                modal.show(modalSubView);
            }
        }    
    });
    if (view.el) {
        view.delegateEvents();
    }

    return modal;
};

module.exports = hasAttachmentModal;
