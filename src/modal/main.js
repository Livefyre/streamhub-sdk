define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/view',
    'streamhub-sdk/content/views/gallery-attachment-list-view',
    'hgn!streamhub-sdk/modal/templates/modal',
    'inherits'
], function($, View, GalleryAttachmentListView, ModalTemplate, inherits) {
    'use strict';

    /**
     * A view that overlays over the entire viewport to display some content
     *
     * @param opts {Object} A set of options to config the view with
     * @fires GalleryAttachmentListView#hideModal.hub
     * @fires GalleryAttachmentListView#error
     * @exports streamhub-sdk/modal
     * @constructor
     */
    var ModalView = function (opts) {
        opts = opts || {};
        this.visible = false;
        this._attached = false;
        this._modalSubView = opts.modalSubView || null;

        View.call(this);

        var self = this;
        $(window).keyup(function (e) {
            // Escape
            if (e.keyCode === 27 && self.visible) {
                self.hide();
            }
        });

        ModalView.instances.push(this);
    };
    inherits(ModalView, View);


    // Store all instances of modal to ensure that only one is visible
    ModalView.instances = [];


    // A singleton container element houses all modals
    ModalView.$el = $('<div class="hub-modals"></div>');
    ModalView.el = ModalView.$el[0];

    // insert it on domReady
    ModalView.insertEl = function () {
        $('body').append(ModalView.el);
    };
    $(document).ready(ModalView.insertEl);


    ModalView.prototype.template = ModalTemplate;
    ModalView.prototype.elClass = ' hub-modal';


    ModalView.prototype.modalElSelector = '.hub-modal';
    ModalView.prototype.closeButtonSelector = '.hub-modal-close';
    ModalView.prototype.containerElSelector = '.hub-modal-content';
    ModalView.prototype.contentViewElSelector = '.hub-modal-content-view';


    /**
     * Makes the modal and its content visible
     * @param modalSubView {View} The view to be displayed in the by the modal
     */
    ModalView.prototype.show = function (modalSubView) {
        // First hide any other modals
        $.each(ModalView.instances, function (i, modal) {
            modal.hide();
        });

        this._oldOverflow = $('body').css('overflow');
        $('body').css({
            'overflow': 'hidden'
        });

        this.$el.show();
        if ( ! this._attached) {
            this._attach();
        }

        this._modalSubView = modalSubView;

        this.render();

        this.visible = true;
    };


    /**
     * Makes the modal and its content not visible
     */
    ModalView.prototype.hide = function () {
        this.$el.hide();
        this._detach();
        this.visible = false;
        $('body').css({
            'overflow': this._oldOverflow || 'scroll'
        });
    };


    /**
     * Creates DOM structure of gallery to be displayed
     */
    ModalView.prototype.render = function () {
        View.prototype.render.call(this);

        this._modalSubView.setElement(this.$el.find(this.contentViewElSelector));
        this._modalSubView.render();
    };


    /**
     * Set the element for the view to render in.
     * ModalView construction takes care of creating its own element in
     *     ModalView.el. You probably don't want to call this manually
     * @private
     * @param element {HTMLElement} The element to render this View in
     * @returns this
     */
    ModalView.prototype.setElement = function (element) {
        View.prototype.setElement.call(this, element);
        var self = this;

        this.$el.addClass(this.elClass);

        this.$el.on('hideModal.hub', function (e) {
            self.hide();
            $('body').css('overflow', 'auto');
        });

        this.$el.on('click', this.closeButtonSelector, function (e) {
            self.$el.trigger('hideModal.hub');
        });

        this.$el.on('click', function (e) {
            /**
             * Hide modal
             * @event GalleryAttachmentListView#hideModal.hub
             */
            if ($(e.target).hasClass('hub-modal-content') || $(e.target).hasClass('hub-modal-close')) {
                self.$el.trigger('hideModal.hub');
            }
        });

        return this;
    };


    /**
     * Attach .el to the DOM
     * @private
     */
    ModalView.prototype._attach = function () {
        this.$el.appendTo(ModalView.$el);
        this._attached = true;
    };


    /**
     * Detach .el from the DOM
     * This may be useful when the modal is hidden, so that
     *     the browser doesn't have to lay it out, and it doesn't
     *     somehow intercept DOM events
     * @private
     */
    ModalView.prototype._detach = function () {
        this.$el.detach();
        this._attached = false;
    };


    return ModalView;
});
