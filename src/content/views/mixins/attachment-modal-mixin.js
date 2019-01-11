var AttachmentGalleryModal = require('streamhub-sdk/modal/views/attachment-gallery-modal');
var CarouselContentView = require('streamhub-sdk/content/views/carousel-content-view');
var GalleryAttachmentListView = require('streamhub-sdk/content/views/gallery-attachment-list-view');
var get = require('mout/object/get');
var merge = require('mout/object/merge');
var ModalView = require('streamhub-sdk/modal');
var omit = require('mout/object/omit');

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

    // Updating the modal options. This allows the options to be modified from
    // other locations and isn't blocked by the anonymous function.
    modal.opts = merge(modal.opts, omit(opts, 'modal'));

    view.events = view.events.extended({
        'focusContent.hub': function (e, context) {
            if (!modal) {
                if (typeof get(view, 'attachmentsView.focus') === 'function') {
                    view.attachmentsView.focus(context.attachmentToFocus);
                }
            } else if (modal.opts.useNewModal) {
                modal.show(new CarouselContentView({
                    collection: (this._collection || {}).internalCollection,
                    content: context.content,
                    doNotTrack: modal.opts.doNotTrack,
                    hideSocialBrandingWithRights: modal.opts.hideSocialBrandingWithRights,
                    listView: this,
                    modal: true,
                    productOptions: modal.opts.productOptions || {},
                    showCTA: modal.opts.showCTA
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
