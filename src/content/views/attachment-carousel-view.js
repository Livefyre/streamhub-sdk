var $ = require('streamhub-sdk/jquery');
var CompositeView = require('view/composite-view');
var CarouselAttachmentListView = require('streamhub-sdk/content/views/carousel-attachment-list-view');
var SingleAttachmentView = require('streamhub-sdk/content/views/single-attachment-view');
var inherits = require('inherits');

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
};
inherits(AttachmentCarouselView, CompositeView);

AttachmentCarouselView.prototype.elTag = 'div';
AttachmentCarouselView.prototype.elClass = 'attachment-carousel';
AttachmentCarouselView.prototype.listClass = '.content-attachments-stacked';
AttachmentCarouselView.prototype.leftSelector = '.attachment-carousel-left-arrow';
AttachmentCarouselView.prototype.rightSelector = '.attachment-carousel-right-arrow';
AttachmentCarouselView.prototype.hideClass = 'hide';

AttachmentCarouselView.prototype.events = CompositeView.prototype.events.extended({}, function (events) {
    var self = this;
    events['click ' + this.leftSelector] = function (e) {
        this._onCarouselNavigate.apply(self, [e, true]);
    };

    events['click ' + this.rightSelector] = function (e) {
        this._onCarouselNavigate.apply(self, [e, false]);
    };

    events['click .' + CarouselAttachmentListView.prototype.elClass + ' ' + CarouselAttachmentListView.prototype.contentAttachmentSelector] = function (e) {
        this._onThumbnailClick.apply(self, [e]);
    };
});

AttachmentCarouselView.prototype._onThumbnailClick = function (e) {
    var index = $('.' + CarouselAttachmentListView.prototype.elClass + ' ' + CarouselAttachmentListView.prototype.contentAttachmentSelector).index(e.currentTarget);
    this._singleAttachmentView.retile(index);
    this._insertVideo(this._singleAttachmentView.oembedViews[index]);
};

AttachmentCarouselView.prototype._insertVideo = function (oembedView) {
    if (!oembedView) {
        return;
    }
    var focusedEl = oembedView.$el;
    if (oembedView.oembed.type === 'video') {
        var photoContentEl = focusedEl.find('.content-attachment-photo');
        setTimeout(function() { photoContentEl.hide(); }, 0);
        var videoContentEl = focusedEl.find('.content-attachment-video');
        videoContentEl.html(this._getAttachmentVideoHtml(oembedView.oembed));
        var videoIframe = videoContentEl.find('iframe');
        videoIframe.css({'width': '100%', 'height': '100%'});

        // Add poster if missing
        var videoEl = videoContentEl.find('video');
        if (videoEl.length > 0) {
            videoEl.attr('poster', oembedView.oembed.thumbnail_url);
            videoEl.css({'width': '100%', 'height': '100%'});
        }

        videoContentEl.show();
    }
};

AttachmentCarouselView.prototype._getAttachmentVideoHtml = function (attachment) {
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

AttachmentCarouselView.prototype._onCarouselNavigate = function (e, left) {
    var listEl = this.$el.find('.' + CarouselAttachmentListView.prototype.elClass + ' ' + CarouselAttachmentListView.prototype.stackedAttachmentsSelector);
    var position = listEl.position().left;
    var attachmentCount = this._attachmentsListView.count();
    var minVisible = (attachmentCount - 2) > 0 ? (attachmentCount - 2) : 0;
    e.stopPropagation();
    if (!left && position < 0) {
        listEl.offset({left: listEl.offset().left + this.opts.carouselElementWidth});
        this.$el.find(this.leftSelector).removeClass(this.hideClass);
        if (listEl.position().left > 0) {
            this.$el.find(this.rightSelector).addClass(this.hideClass);
        }
    } else if (left && position > -(minVisible * this.opts.carouselElementWidth)) {
        listEl.offset({left: listEl.offset().left - this.opts.carouselElementWidth});
        this.$el.find(this.rightSelector).removeClass(this.hideClass);
        if (listEl.position().left < -(attachmentCount * this.opts.carouselElementWidth)) {
            this.$el.find(this.leftSelector).addClass(this.hideClass);
        }
    }
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

    this._insertVideo(this._singleAttachmentView.oembedViews[0]);
    this._jsPositioning();
    return this;
};

AttachmentCarouselView.prototype._jsPositioning = function () {
    if (this._attachmentsListView) {
        this._attachmentsListView.$el.find(this._attachmentsListView.stackedAttachmentsSelector)
            .width(this.opts.carouselElementWidth * this._attachmentsListView.count());
    }
};

AttachmentCarouselView.prototype.getTemplateContext = function () {
    return $.extend({}, this.opts);
};

module.exports = AttachmentCarouselView;
