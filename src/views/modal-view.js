define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/view',
    'streamhub-sdk/content/views/gallery-attachment-list-view',
    'hgn!streamhub-sdk/views/templates/modal-view',
    'streamhub-sdk/util'
], function($, View, GalleryAttachmentListView, ModalTemplate, util) {

    /**
     * A view that overlays over the entire viewport to display some content
     *
     * @param opts {Object} A set of options to config the view with
     * @param opts.modal {Function} A function to create a content view to be displayed within the modal view
     * @fires GalleryAttachmentListView#hideModal.hub
     * @exports streamhub-sdk/views/modal-view
     * @constructor
     */
    var ModalView = function (opts) {
        opts = opts || {};
        this.visible = false;
        if (opts.modal) {
            this._createModalContentView = opts.modal;
        }

        View.call(this);

        var self = this;
        $(window).keyup(function(e) {
            // Escape
            if (e.keyCode == 27 && self.visible) {
                self.hide();
            }
        });

        $(window).on('mousewheel', function(e) {
            if (self.visible) {
                e.preventDefault();
            }
        });
    };
    util.inherits(ModalView, View);

    ModalView.prototype.template = ModalTemplate;

    ModalView.prototype.modalElSelector = '.hub-modal';
    ModalView.prototype.closeButtonSelector = '.hub-modal-close';
    ModalView.prototype.containerElSelector = '.hub-modal-content';

    /**
     * Set the element for the view to render in.
     * You will probably want to call .render() after this, but not always.
     * @param element {HTMLElement} The element to render this View in
     * @returns this
     */
    ModalView.prototype.setElement = function (element) {
        View.prototype.setElement.call(this, element);

        var self = this;
        this.$el.on('hideModal.hub', function (e) {
            self.hide();
        });

        return this;
    };

    /**
     * Initialize the modal by appending the modal container as a sibling of the body element
     */
    ModalView.prototype.initModal = function () {
        var modalEl = $(this.modalElSelector, 'body');
        if (! modalEl.length) {
            modalEl = $(this.template());
            $('body').append(modalEl);
        }
        this.modalEl = modalEl;
        this.modalContainerEl = modalEl.find(this.containerElSelector);

        var self = this;
        modalEl.on('click', this.closeButtonSelector, function (e) {
            self.hide();
        });

        this.setElement(this.modalContainerEl);
    };

    /**
     * Sets the content object and optional attachment to be displayed in the content view 
     * @param content {Content} The content to be displayed in the content view by the modal
     * @param opts {Object} The content to be displayed in the content view by the modal
     * @param opts.attachment {Oembed} The attachment to be focused in the content view
     */
    ModalView.prototype.setFocus = function (content, opts) {
        opts = opts || {};
        if (! this.modalContentView) {
            this.modalContentView = this._createModalContentView();
        }
        this.modalContentView.setContent(content);
        if (opts.attachment) {
            this.modalContentView.setFocusedAttachment(opts.attachment);
        }
    };

    /**
     * Creates a the content view to display within the modal view
     * @param content {Content} The content to be displayed in the content view by the modal
     * @param opts {Object} The content to be displayed in the content view by the modal
     * @param opts.attachment {Oembed} The attachment to be focused in the content view
     */
    ModalView.prototype._createModalContentView = function (content, opts) {
        opts = opts || {};
        var modalContentView = new GalleryAttachmentListView({
            content: content,
            attachmentToFocus: opts.attachment
        });
        return modalContentView;
    };

    /**
     * Creates DOM structure of gallery to be displayed
     */
    ModalView.prototype.render = function () {
        if (! this.modalEl) {
            this.initModal();
        }
        if (! this.modalContentView) {
            this.modalContentView = this._createModalContentView();
        }
        this.modalContentView.$el.appendTo(this.modalContainerEl);
        this.modalContentView.render(); 
    };

    /**
     * Makes the modal and its content visible
     */
    ModalView.prototype.show = function() {
        this.render();
        this.modalContentView.$el.show();
        this.modalEl.show();
        this.visible = true;
    };

    /**
     * Makes the modal and its content not visible
     */
    ModalView.prototype.hide = function() {
        this.modalEl.hide();
        this.visible = false;
    };

    return ModalView;
});
