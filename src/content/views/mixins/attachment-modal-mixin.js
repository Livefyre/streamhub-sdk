var AttachmentGalleryModal = require('streamhub-sdk/modal/views/attachment-gallery-modal');
var GalleryAttachmentListView = require('streamhub-sdk/content/views/gallery-attachment-list-view');
var get = require('mout/object/get');
var ModalContentCardView = require('streamhub-sdk/content/views/modal-content-card-view');
var ModalView = require('streamhub-sdk/modal');

'use strict';

/**
 * A mixin that decorates an instance of View (e.g. ListView, ContentView)
 * to add a event handler for focusContent.hub that displays a modal
 */
function hasAttachmentModal(view, opts) {
    opts = opts || {};
    var modal = opts.modal;

    if (modal === undefined || modal === true) {
        modal = new (opts.useNewModal ? ModalView : AttachmentGalleryModal)();
    }

    view.events = view.events.extended({
        'focusContent.hub': function(e, context) {
            if (!modal) {
                if (typeof get(view, 'attachmentsView.focus') === 'function') {
                    view.attachmentsView.focus(context.attachmentToFocus);
                }
            } else if (opts.useNewModal) {
                modal.show(new ModalContentCardView({
                    content: context.content,
                    productOptions: opts.productOptions || {}
                }));
            } else {
                modal.show(new GalleryAttachmentListView(context));
            }
        }
    });
    if (view.el) {
        view.delegateEvents();
    }

    return modal;
};

module.exports = hasAttachmentModal;
