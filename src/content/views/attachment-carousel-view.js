var $ = require('streamhub-sdk/jquery');
var asMediaMaskMixin = require('streamhub-sdk/content/views/mixins/media-mask-mixin');
var audioTemplate = require('hgn!streamhub-sdk/content/templates/oembed-audio-tag');
var CarouselAttachmentListView = require('streamhub-sdk/content/views/carousel-attachment-list-view');
var CompositeView = require('view/composite-view');
var inherits = require('inherits');
var SingleAttachmentView = require('streamhub-sdk/content/views/single-attachment-view');
var util = require('streamhub-sdk/content/util/main');

'use strict';

/**
 * A version of the tiled attachement list view that only shows a single image
 * @param opts {Object} A set of options to config the view with
 * @param opts.el {HTMLElement} The element in which to render the streamed content
 * @param opts.content {Content} The content instance with which to display its attachments
 * @param opts.carouselElementWidth {Number} Should be the total width of styled AttachmentListView elements.
 * Used to calculate amount to shift per navigation.
 * @fires TiledAttachmentListView#focusContent.hub
 * @exports streamhub-sdk/views/AttachmentCarouselView
 * @constructor
 */
var AttachmentCarouselView = function (opts) {
    opts = opts || {};
    opts.carouselElementWidth = opts.carouselElementWidth || 90;
    CompositeView.call(this, opts);
    this._addInitialChildViews(opts);
    asMediaMaskMixin(this, opts);
};
inherits(AttachmentCarouselView, CompositeView);

AttachmentCarouselView.prototype.elTag = 'div';
AttachmentCarouselView.prototype.elClass = 'attachment-carousel';
AttachmentCarouselView.prototype.hideClass = 'hide';
AttachmentCarouselView.prototype.listClass = '.content-attachments-stacked';
AttachmentCarouselView.prototype.attachmentSelector = '.' +
    CarouselAttachmentListView.prototype.elClass + ' ' +
    CarouselAttachmentListView.prototype.contentAttachmentSelector;
AttachmentCarouselView.prototype.leftSelector = '.attachment-carousel-left-arrow';
AttachmentCarouselView.prototype.rightSelector = '.attachment-carousel-right-arrow';
AttachmentCarouselView.prototype.stackedAttachmentsSelector = '.' +
    CarouselAttachmentListView.prototype.elClass + ' ' +
    CarouselAttachmentListView.prototype.stackedAttachmentsSelector;

AttachmentCarouselView.prototype.events = CompositeView.prototype.events.extended({}, function (events) {
    events['click ' + this.attachmentSelector] = this._onThumbnailClick.bind(this);
    events['click ' + this.leftSelector] = this._onCarouselNavigate.bind(this, false);
    events['click ' + this.rightSelector] = this._onCarouselNavigate.bind(this, true);
    events['keypress ' + this.attachmentSelector] = util.enterKeypressWrapper(this._onThumbnailClick.bind(this));
    events['keypress ' + this.leftSelector] = util.enterKeypressWrapper(this._onCarouselNavigate.bind(this, false));
    events['keypress ' + this.rightSelector] = util.enterKeypressWrapper(this._onCarouselNavigate.bind(this, true));
});

AttachmentCarouselView.prototype._onThumbnailClick = function (e) {
    var index = $(this.attachmentSelector).index(e.currentTarget);
    var oembedView = this._singleAttachmentView.oembedViews[index];
    this._singleAttachmentView.retile(index);
    this.renderMediaMask(oembedView.oembed, true, function () {
        this._insertMedia(oembedView);
    }.bind(this));
};

AttachmentCarouselView.prototype._insertMedia = function (oembedView) {
    if (!oembedView) {
        return;
    }
    var focusedEl = oembedView.$el;
    var oembed = oembedView.oembed;

    if (['audio', 'video'].indexOf(oembed.type) === -1) {
        return;
    }

    var photoContentEl = focusedEl.find('.content-attachment-photo');
    setTimeout(function() { photoContentEl.hide(); }, 0);

    var mediaContentEl = focusedEl.find('.content-attachment-' + oembed.type);
    mediaContentEl.html(this._getAttachmentHtml(oembed));
    var mediaIframe = mediaContentEl.find('iframe');
    mediaIframe.css({height: '100%', width: '100%'});

    if (oembed.type === 'video') {
        // Add poster if missing
        var videoEl = mediaContentEl.find('video');
        if (videoEl.length > 0) {
            videoEl.attr('poster', oembed.thumbnail_url);
            videoEl.css({height: '100%', width: '100%'});
        }
        // Strip photoContent of inline styling to avoid image loading behind video
        photoContentEl.removeAttr('style');
    }
    mediaContentEl.show();
};

AttachmentCarouselView.prototype._getAttachmentHtml = function (attachment) {
    // It's possible that the audio is not an iframe, so build an audio tag html
    // embed. We should encode audio to mp3 if it's not submitted as such. The
    // reason is that all browsers support mp3 but support for other types is
    // spotty at best.
    if (attachment.type === 'audio' && !attachment.html) {
        return audioTemplate({url: attachment.url, type: 'audio/mpeg'});
    }

    var AUTOPLAY_PROVIDER_REGEX = /youtube|livefyre|facebook/;
    // If the provider is not available for autoplay, nothing more to do.
    if (!attachment.provider_name || !AUTOPLAY_PROVIDER_REGEX.test(attachment.provider_name.toLowerCase())) {
        return attachment.html;
    }

    var $html = $(attachment.html);
    var iframe = $html[0].tagName === 'IFRAME' ? $html[0] : $html.find('iframe')[0];
    var video = $html[0].tagName === 'VIDEO' ? $html[0] : $html.find('video')[0];

    if (video) {
        video.setAttribute('autoplay', true);
        return video.outerHTML;
    }

    if (iframe) {
        var queryChar = iframe.src.indexOf('?') > -1 ? '&' : '?';
        iframe.src += queryChar + 'autoplay=1';

        if (attachment.type === 'audio') {
            iframe.src += '&backgroundColor=%231F242C';
        }

        // make youtube videos not show related videos
        var srcIndex = iframe.src.indexOf('src=');
        var youtubeIndex = iframe.src.indexOf('youtube', srcIndex);
        var nextAmpersand = iframe.src.indexOf('&', srcIndex);
        // youtube is in the source
        if (youtubeIndex < nextAmpersand && srcIndex > -1 && nextAmpersand > -1) {
            iframe.src = iframe.src.substring(0, nextAmpersand) + '%26rel%3D0' + iframe.src.substring(nextAmpersand);
        }

        return $('<div>').append($html).html();
    }

    return attachment.html;
};

/**
 * Update the thumbnail items that are in view. This keeps the tabindex value
 * up to date on the thumbnails depending on if they are in view or not. If not
 * in view, we don't want users tabbing to items that they can't see.
 */
AttachmentCarouselView.prototype.updateItemsInView = function () {
    var listEl = this.$el.find(this.stackedAttachmentsSelector);
    var visibleWidth = listEl.parent().width();
    var parentOffset = listEl.parent().offset().left;

    // Loops through all of the attachment thumbnails in the carousel and
    // updates the tabindex on each of them depending on if they are in view
    // or not.
    this._attachmentsListView.oembedViews.forEach(function (view) {
        var attachmentEl = view.$el.find('.content-attachment');
        var offset = attachmentEl.offset().left;
        var outOfViewLeft = (offset + attachmentEl.width()) < parentOffset;
        var outOfViewRight = offset > (parentOffset + visibleWidth);
        var idx = outOfViewLeft || outOfViewRight ? -1 : 0;
        attachmentEl
            .attr('aria-label', 'Thumbnail')
            .attr('role', 'button')
            .attr('tabindex', idx);
    });
};

/**
 * Update the navigation buttons to toggle their visibility depending on if
 * there are any items to scroll to in their direction.
 */
AttachmentCarouselView.prototype.updateNavigationButtons = function () {
    var leftArrow = this.$el.find(this.leftSelector);
    var rightArrow = this.$el.find(this.rightSelector);
    var listEl = this.$el.find(this.stackedAttachmentsSelector);

    var leftPos = parseInt(listEl.css('left').split('px'), 10) || 0;
    leftArrow.toggleClass(this.hideClass, leftPos >= 0);

    var listWidth = listEl.width();
    var visibleWidth = listEl.parent().width();
    rightArrow.toggleClass(this.hideClass, listWidth <= (visibleWidth + Math.abs(leftPos)));
};

/**
 * Handle the carousel navigation by updating the left offset of the list
 * element so that the thumbnails can be navigated.
 * @param {boolean} right If navigating to the right, left otherwise.
 * @param {Event} e Navigation click event.
 */
AttachmentCarouselView.prototype._onCarouselNavigate = function (right, e) {
    e.stopPropagation();

    var direction = right ? -1 : 1;
    var listEl = this.$el.find(this.stackedAttachmentsSelector);
    // Update the left position of the thumbnail carousel in the direction of
    // the arrow that was pressed.
    listEl.offset({left: listEl.offset().left + (direction * this.opts.carouselElementWidth)});

    this.updateItemsInView();
    this.updateNavigationButtons();
};

/**
 * @param {Object} opts
 * @param {boolean=} shouldRender
 */
AttachmentCarouselView.prototype._addInitialChildViews = function (opts, shouldRender) {
    var renderOpts = {render: !!shouldRender};

    this._singleAttachmentView = opts.singleAttachmentView || new SingleAttachmentView(opts);
    this.add(this._singleAttachmentView, renderOpts);

    if (this._singleAttachmentView.tileableCount() > 1) {
        this._attachmentsListView = opts.attachmentsListView || new CarouselAttachmentListView(opts);
        this.add(this._attachmentsListView, renderOpts);
    }
};

AttachmentCarouselView.prototype.add = function (view) {
    this._childViews.push(view);
    return this;
};

AttachmentCarouselView.prototype.render = function (view, opts) {
    CompositeView.prototype.render.call(this);

    this.$el.find(this.leftSelector).addClass(this.hideClass);
    this._jsPositioning();

    var oembedViews = this._singleAttachmentView.oembedViews;
    oembedViews.length && this.renderMediaMask(oembedViews[0].oembed, true, function () {
        this._insertMedia(oembedViews[0]);
    }.bind(this));

    if (!this.$el.find(this.stackedAttachmentsSelector).length) {
        return this;
    }

    // Since it's being loaded before all of the view has settled, the sizes of
    // the list view and it's parent are higher than they should be. Using
    // setTimeout cleans it up so that it's the right sizing.
    setTimeout(function () {
        this.updateItemsInView();
        this.updateNavigationButtons();
    }.bind(this), 0);

    return this;
};

AttachmentCarouselView.prototype._jsPositioning = function () {
    if (!this._attachmentsListView) {
        return;
    }
    this._attachmentsListView.$el
        .find(this._attachmentsListView.stackedAttachmentsSelector)
        .width(this.opts.carouselElementWidth * this._attachmentsListView.count());
};

AttachmentCarouselView.prototype.getTemplateContext = function () {
    return $.extend({}, this.opts);
};

module.exports = AttachmentCarouselView;
