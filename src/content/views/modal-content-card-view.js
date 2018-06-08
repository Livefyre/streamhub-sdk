var $ = require('streamhub-sdk/jquery');
var AttachmentCarouselView = require('streamhub-sdk/content/views/attachment-carousel-view');
var CompositeView = require('view/composite-view');
var debug = require('debug');
var find = require('mout/array/find');
var get = require('mout/object/get');
var impressionUtil = require('streamhub-sdk/impressionUtil');
var inherits = require('inherits');
var ProductContentView = require('streamhub-sdk/content/views/product-content-view');

'use strict';

var hasInnerHtmlBug = null;
var log = debug('streamhub-sdk/content/views/content-view');

/**
 * Defines the base class for all content-views. Handles updates to attachments
 * and loading of images.
 *
 * @param opts {Object} The set of options to configure this view with.
 * @param opts.content {Content} The content object to use when rendering.
 * @param opts.el {?HTMLElement} The element to render this object in.
 * @param opts.attachmentsView {View}
 * @fires ModalContentCardView#removeModalContentCardView.hub
 * @exports streamhub-sdk/content/views/content-view
 * @constructor
 */
var ModalContentCardView = function (opts) {
    opts = opts || {};

    this.content = opts.content;
    this._isInstagramVideo = this.content.source === "instagram" && this.content.attachments.length > 0 && this.content.attachments[0].type === 'video';
    this.createdAt = new Date(); // store construction time to use for ordering if this.content has no dates

    CompositeView.call(this, opts);

    this._addInitialChildViews(opts);
    impressionUtil.recordImpression(opts.content);

    if (this.content) {
        this.content.on('change:body', function (newVal, oldVal) {
            this._handleBodyChange();
        }.bind(this));

        this.content.on('change:attachments', function (newVal, oldVal) {
            this._handleAttachmentsChange();
        }.bind(this));

        this.$el.on('insights:local', function (evt, data) {
            if (data.type.search(/^Share(?:T|F|U)/) < 0) {
                data.content = opts.content;
            }
        });
    }
    window.addEventListener('resize', this._resizeModalImage.bind(this));
};
inherits(ModalContentCardView, CompositeView);

ModalContentCardView.prototype.elTag = 'article';
ModalContentCardView.prototype.elClass = 'content';
ModalContentCardView.prototype.contentWithImageClass = 'content-with-image';
ModalContentCardView.prototype.imageLoadingClass = 'hub-content-image-loading';
ModalContentCardView.prototype.invalidClass = 'content-invalid';
ModalContentCardView.prototype.rightsGrantedClass = 'content-rights-granted';
ModalContentCardView.prototype.textOnlyClass = 'text-only';
ModalContentCardView.prototype.attachmentsElSelector = '.content-attachments';
ModalContentCardView.prototype.attachmentFrameElSelector = '.content-attachment-frame';
ModalContentCardView.prototype.modalSelector = '.hub-modal';
ModalContentCardView.prototype.modalAnnotationClass = 'modal-content-card';

ModalContentCardView.prototype.events = CompositeView.prototype.events.extended({
    'imageLoaded.hub': function (e) {
        this.$el.addClass(this.contentWithImageClass);
        this.$el.removeClass(this.imageLoadingClass);

        e.stopPropagation();
        this.$el.parent().trigger('imageLoaded.hub', {ModalContentCardView: this});
    },
    'imageError.hub': function (e, oembed) {
        this.content.removeAttachment(oembed);

        if (this._thumbnailAttachmentsView && !this._thumbnailAttachmentsView.tileableCount()) {
            this.$el.removeClass(this.contentWithImageClass);
            this.$el.removeClass(this.imageLoadingClass);
        }

        e.stopPropagation();
        this.$el.parent().trigger('imageError.hub', {oembed: oembed, ModalContentCardView: this});
    }
});

/**
 * @param {Object} opts
 * @param {boolean=} shouldRender
 */
ModalContentCardView.prototype._addInitialChildViews = function (opts, shouldRender) {
    var renderOpts = {render: !!shouldRender};
    opts.isInstagramVideo = this._isInstagramVideo;

    if (!opts.isInstagramVideo) {
        this._attachmentsView = opts.attachmentsView || new AttachmentCarouselView(opts);
        this.add(this._attachmentsView, renderOpts);
    }

    this._productContentView = opts.productContentView || new ProductContentView(opts);
    this.add(this._productContentView, renderOpts);
};

ModalContentCardView.prototype._removeInitialChildViews = function () {
    this._attachmentsView && this.remove(this._attachmentsView);
    this._bodyView && this.remove(this._bodyView);
    this._productContentView && this.remove(this._productContentView);
    this._ctaView && this._ctaView.destroy();
};

/**
 * Set the .el DOMElement that the ModalContentCardView should render to
 * @param el {DOMElement} The new element the ModalContentCardView should render to
 * @returns {ModalContentCardView}
 */
ModalContentCardView.prototype.setElement = function (el) {
    CompositeView.prototype.setElement.apply(this, arguments);

    if (this.content.attachments.length) {
        var tileable = !!(this._thumbnailAttachmentsView && this._thumbnailAttachmentsView.tileableCount());
        this.$el.toggleClass(this.imageLoadingClass, tileable);
    }

    if (this.content && this.content.id) {
        this.$el.attr('data-content-id', this.content.id);
    }

    this.$el.toggleClass(this.rightsGrantedClass, this.content.hasRightsGranted());
    return this;
};

/**
 * Gets the template rendering context. By default, returns "this.content".
 * @returns {Content} The content object this view was instantiated with.
 */
ModalContentCardView.prototype.getTemplateContext = function () {
    return $.extend({}, this.content);
};

/**
 * Removes the content view element, and triggers 'removeModalContentCardView.hub'
 * event for the instance to be removed from its associated ListView.
 */
ModalContentCardView.prototype.remove = function () {
    /**
     * removeModalContentCardView.hub
     * @event ModalContentCardView#removeModalContentCardView.hub
     * @type {{ModalContentCardView: ModalContentCardView}}
     */
    this.$el.trigger('removeModalContentCardView.hub', {ModalContentCardView: this});
    this.$el.detach();
};

ModalContentCardView.prototype._handleBodyChange = function (newVal, oldVal) {
    this._bodyView.render();
};

ModalContentCardView.prototype._handleAttachmentsChange = function () {
    this._removeInitialChildViews();
    this._addInitialChildViews(this.opts, true);
};

ModalContentCardView.prototype._isTextOnly = function () {
    if (!this.content.attachments.length) {
        return true;
    }
    return !!find(this.content.attachments, function (attachment) {
        return attachment.type === 'link';
    });
};

ModalContentCardView.prototype._resizeModalImage = function () {
    // Unsure if this is still needed. It causes a bug when there are multiple
    // attachments because it sets the padding on the first image. When a
    // thumbnail is clicked, the first image stays visible while the thumbnail
    // is expanded, so both images are displayed.
    return;
    var modal = this.$el.closest(this.modalSelector);
    var attachment = modal.find('.hub-modal-content .attachment-carousel .content-attachment.content-attachment-square-tile');
    var winHeight = $(window).height();
    if (winHeight <= 600 && attachment.outerHeight() > winHeight) {
        attachment.css('padding-bottom', winHeight + 'px');
    } else {
        attachment.css('padding-bottom', '100%');
    }
};

ModalContentCardView.prototype.destroy = function () {
    CompositeView.prototype.destroy.call(this);
    this.content = null;
    this.$el.closest(this.modalSelector).removeClass(this.modalAnnotationClass);
    window.removeEventListener('resize', this._resizeModalImage);
};

/**
 * Render the content inside of the ModalContentCardView's element.
 * @returns {ModalContentCardView}
 */
ModalContentCardView.prototype.render = function () {
    CompositeView.prototype.render.call(this);

    this.$el.toggleClass(this.textOnlyClass, this._isTextOnly());
    this.$el.closest(this.modalSelector).addClass(this.modalAnnotationClass);
    if (this._isInstagramVideo) {
        this.$el.closest(this.modalSelector).addClass('instagram-video');
        this.$el.find('iframe').removeAttr('style');
    }

    this._resizeModalImage();

    return this;
};

ModalContentCardView.prototype.onInsert = function () {
    for (var i = 0; i < this._childViews.length; i++) {
        var view = this._childViews[i];
        if (view.onInsert) {
            view.onInsert();
        }
    }
};

module.exports = ModalContentCardView;
