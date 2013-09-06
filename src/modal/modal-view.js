define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/view',
    'streamhub-sdk/modal/views/gallery-attachment-list-view',
    'hgn!streamhub-sdk/modal/templates/modal-view',
    'streamhub-sdk/util'
], function($, View, GalleryAttachmentListView, ModalTemplate, util) {

    /**
     * A view that overlays over the entire viewport to display some content
     *
     * @param opts {Object} A set of options to config the view with
     * @param opts.createContentView {Function} A function to create a content view to be displayed within the modal view
     * @fires GalleryAttachmentListView#hideModal.hub
     * @exports streamhub-modal/modal-view
     * @constructor
     */
    var ModalView = function (opts) {
        opts = opts || {};
        this.visible = false;
        this._rendered = false;

        if (opts.createContentView) {
            this._createModalContentView = opts.createContentView;
        }

        this.modalContentView = this._createModalContentView();

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

        ModalView.instances.push(this);
    };
    util.inherits(ModalView, View);


    ModalView.instances = [];


    // Create the singleton container element that will house all modals
    ModalView.$el = $('<div class="hub-modals"></div>')
    ModalView.el = ModalView.$el[0];


    ModalView.insertEl = function () {
        $('body').append(ModalView.el);
    }
    $(document).ready(ModalView.insertEl);


    ModalView.prototype.template = ModalTemplate;
    ModalView.prototype.elClass = ' hub-modal';

    ModalView.prototype.modalElSelector = '.hub-modal';
    ModalView.prototype.closeButtonSelector = '.hub-modal-close';
    ModalView.prototype.containerElSelector = '.hub-modal-content';


    /**
     * @private
     * Set the element for the view to render in.
     * You will probably want to call .render() after this, but not always.
     * @param element {HTMLElement} The element to render this View in
     * @returns this
     */
    ModalView.prototype.setElement = function (element) {
        View.prototype.setElement.call(this, element);
        var self = this;

        this.$el.addClass(this.elClass);

        this.$el.on('hideModal.hub', function (e) {
            self.hide();
        });

        this.$el.on('click', this.closeButtonSelector, function (e) {
            self.hide();
        });

        return this;
    };


    /**
     * Sets the content object and optional attachment to be displayed in the content view 
     * @param content {Content} The content to be displayed in the content view by the modal
     * @param opts {Object} The content to be displayed in the content view by the modal
     * @param opts.attachment {Oembed} The attachment to be focused in the content view
     */
    ModalView.prototype.setFocus = function (content, opts) {
        opts = opts || {};
        this.modalContentView.setContent(content, opts);
    };


    /**
     * Creates a the content view to display within the modal view
     * @param content {Content} The content to be displayed in the content view by the modal
     * @param opts {Object} The content to be displayed in the content view by the modal
     * @param opts.attachment {Oembed} The attachment to be focused in the content view
     * @private
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
     * @private
     * Creates DOM structure of gallery to be displayed
     */
    ModalView.prototype.render = function () {
        View.prototype.render.call(this);

        this.$el.appendTo(ModalView.$el);

        this.modalContentView.setElement(this.$el.find(this.containerElSelector));
        this.modalContentView.render(); 

        this._rendered = true;
    };


    /**
     * Makes the modal and its content visible
     */
    ModalView.prototype.show = function(content, options) {
        if (content) {
            this.setFocus(content, options);
        }

        // First hide any other modals
        $.each(ModalView.instances, function (i, modal) {
            modal.hide();
        });

        this.$el.show();
        if ( ! this._rendered) {
            this.render();
        }
        this.visible = true;
    };


    /**
     * Makes the modal and its content not visible
     */
    ModalView.prototype.hide = function() {
        this.$el.hide();
        this.visible = false;
    };


    return ModalView;
});
