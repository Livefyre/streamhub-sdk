define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/view',
    'streamhub-sdk/content/views/tiled-attachment-list-view',
    'streamhub-sdk/content/views/oembed-view',
    'hgn!streamhub-sdk/content/templates/gallery-attachment-list',
    'hgn!streamhub-sdk/content/templates/content-byline',
    'inherits'],
function($, View, TiledAttachmentListView, OembedView, GalleryAttachmentListTemplate, contentBylineTemplate, inherits) {
    'use strict';

    /**
     * A view that displays a content's attachments as a gallery
     *
     * @param opts {Object} A set of options to config the view with
     * @param opts.el {HTMLElement} The element in which to render the streamed content
     * @param opts.content {Content} The content containing attachments to display as a gallery
     * @param opts.attachmentToFocus {Oembed} The attachment to focus in the gallery
     * @param opts.userInfo {boolean} Whether to display the user info
     * @param opts.pageButtons {boolean} Whether to display next/previous page buttons
     * @param opts.pageCount {boolean} Whether to display the page count/index
     * @param opts.thumbnails {boolean} Whether to display the thumbnails of all attachments
     * @param opts.proportionalThumbnails {boolean} Whether the thumbnail widths are proportional to the gallery container
     * @fires GalleryAttachmentListView#hideModal.hub
     * @exports streamhub-sdk/views/gallery-attachment-list-view
     * @constructor
     */
    var GalleryAttachmentListView = function(opts) {
        opts = opts || {};
        View.call(this, opts);

        this.userInfo = opts.userInfo === undefined ? true : opts.userInfo;
        this.pageButtons = opts.pageButtons === undefined ? true : opts.pageButtons;
        this.pageCount = opts.pageCount === undefined ? true : opts.pageCount;
        this.thumbnails = opts.thumbnails === undefined ? false : opts.thumbnails;
        this.proportionalThumbnails = opts.proportionalThumbnails === undefined ? false : opts.proportionalThumbnails;
        this.focusedIndex = 0;
        this.oembedViews = [];

        if (opts.content) {
            this.setContent(opts.content);
        }
        
        if (opts.attachmentToFocus) {
            this.setFocusedAttachment(opts.attachmentToFocus);
        }

        var self = this;
        $(window).on('resize', function(e) {
            self.resizeFocusedAttachment();
        });

        $(window).on('keyup', function(e) {
            e.preventDefault();
            if (!self.pageButtons) {
                return;
            }
            if (e.keyCode === 37) {
                // left arrow
                self.prev();
            } else if (e.keyCode === 39) {
                // right arrow
                self.next();
            }
        });
    };
    inherits(GalleryAttachmentListView, View);
    $.extend(GalleryAttachmentListView.prototype, TiledAttachmentListView.prototype);

    GalleryAttachmentListView.prototype.template = GalleryAttachmentListTemplate;
    GalleryAttachmentListView.prototype.attachmentsGallerySelector = '.content-attachments-gallery';
    GalleryAttachmentListView.prototype.focusedAttachmentsSelector = '.content-attachments-gallery-focused';
    GalleryAttachmentListView.prototype.galleryThumbnailsSelector = '.content-attachments-gallery-thumbnails';
    GalleryAttachmentListView.prototype.galleryPrevSelector = '.content-attachments-gallery-prev';
    GalleryAttachmentListView.prototype.galleryNextSelector = '.content-attachments-gallery-next';
    GalleryAttachmentListView.prototype.galleryCloseSelector = '.content-attachments-gallery-close';
    GalleryAttachmentListView.prototype.galleryCountSelector = '.content-attachments-gallery-count';
    GalleryAttachmentListView.prototype.galleryCurrentPageSelector = '.content-attachments-gallery-current-page';
    GalleryAttachmentListView.prototype.galleryTotalPagesSelector = '.content-attachments-gallery-total-pages';
    GalleryAttachmentListView.prototype.focusedAttachmentClassName = 'content-attachments-focused';
    GalleryAttachmentListView.prototype.attachmentMetaSelector = '.content-attachments-meta';
    GalleryAttachmentListView.prototype.actualImageSelector = '.content-attachment-actual-image';

    /**
     * Set the attachment instance to be displayed as the focused item in the gallery
     * @param element {Oembed} The attachment to focus in the gallery
     */
    GalleryAttachmentListView.prototype.setFocusedAttachment = function (attachment) {
        attachment = attachment.el ? attachment.oembed : attachment;
        this._focusedAttachment = attachment;
    };

    /**
     * Set the element for the view to render in.
     * You will probably want to call .render() after this, but not always.
     * @param element {HTMLElement} The element to render this View in
     * @returns this
     */
    GalleryAttachmentListView.prototype.setElement = function (element) {
        View.prototype.setElement.call(this, element);

        var self = this;
        this.$el.on('click', function (e) {
            /**
             * Hide modal
             * @event GalleryAttachmentListView#hideModal.hub
             */
            self.$el.trigger('hideModal.hub');
        });
        this.$el.on(
            'click',
            [this.attachmentMetaSelector, this.galleryNextSelector, this.galleryPrevSelector, this.actualImageSelector].join(','),
            function (e) {
                e.stopPropagation();
                if (!self.pageButtons) {
                    return;
                }
                if ($(e.currentTarget).hasClass(self.galleryNextSelector.substring(1)) || $(e.currentTarget).hasClass(self.actualImageSelector.substring(1))) {
                    self.next();
                } else if ($(e.currentTarget).hasClass(self.galleryPrevSelector.substring(1))) {
                    self.prev();
                }
            }
        );

        this.$el.on('focusContent.hub', function(e, context) {
            if (context.content) {
                for (var i=0; i < context.content.attachments; i++) {
                    self.add(context.content.attachments[i]);
                }
            }
            self.setFocusedAttachment(context.attachmentToFocus);
            self.render();
        });

        return this;
    };

    /**
     * Creates DOM structure of gallery to be displayed
     */
    GalleryAttachmentListView.prototype.render = function () {
        TiledAttachmentListView.prototype.render.call(this);

        var attachmentsGalleryEl = this.$el.find(this.attachmentsGallerySelector);
        var self = this;
        $.each(this.oembedViews, function (i, oembedView) {
            oembedView.$el.appendTo(attachmentsGalleryEl.find(self.galleryThumbnailsSelector));
            oembedView.$el.on('click', function(e) {
                $(e.target).trigger('focusContent.hub', { content: self.content, attachmentToFocus: oembedView.oembed });
            });
            oembedView.render();
        });

        var contentMetaEl = this.$el.find(this.attachmentMetaSelector);
        contentMetaEl[ this.userInfo ? 'show' : 'hide' ]();

        var pageButtonEls = this.$el.find([this.galleryPrevSelector, this.galleryNextSelector].join(','));
        pageButtonEls[ this.pageButtons ? 'show' : 'hide' ]();

        var pageCountEl = this.$el.find(this.galleryCountSelector);
        pageCountEl[ this.pageCount ? 'show' : 'hide' ]();

        var thumbnailsEl = this.$el.find(this.galleryThumbnailsSelector);
        thumbnailsEl[this.thumbnails && this.tileableCount() ? 'show' : 'hide']();

        if (this.proportionalThumbnails) {
            var thumbnailTileEls = thumbnailsEl.children();
            for (var i=0; i < thumbnailTileEls.length; i++) {
                thumbnailTileEls.eq(i).width(100 / thumbnailTileEls.length + '%').height(75);
            }
        }

        this.focus();
        this._rendered = true;
    };


    GalleryAttachmentListView.prototype.setContent = function (content, opts) {
        opts = opts || {};
        TiledAttachmentListView.prototype.setContent.apply(this, arguments);
        if (opts.attachment) {
            this.setFocusedAttachment(opts.attachment);
        }
        if (this._rendered) {
            this.render();
        }
    };


    /**
     * Appends a new OembedView given an Oembed instance to the view
     * @param oembed {Oembed} A Oembed instance to insert into the view
     * @returns {OembedView} The OembedView associated with the newly inserted oembed
     */
    GalleryAttachmentListView.prototype._insert = function (oembedView) {
        var self = this;
        var stackedAttachmentsEl = this.$el.find(this.stackedAttachmentsSelector);
        var attachmentsGalleryEl = this.$el.find(this.attachmentsGallerySelector);

        if (this.isTileableAttachment(oembedView.oembed)) {
            oembedView.$el.appendTo(attachmentsGalleryEl.find(this.galleryThumbnailsSelector));
            oembedView.$el.on('click', function(e) {
                /**
                 * Focus content
                 * @event TiledAttachmentListView#focusContent.hub
                 */
                $(e.target).trigger('focusContent.hub', { content: self.content, attachmentToFocus: oembedView.oembed });
            });
        } else {
            oembedView.$el.appendTo(stackedAttachmentsEl);
        }

        return oembedView;
    };

    /**
     * Add a Oembed attachment to the Attachments view. 
     * @param oembed {Oembed} A Oembed instance to render in the View
     * @returns {AttachmentListView} By convention, return this instance for chaining
     */
    GalleryAttachmentListView.prototype.add = function (oembed) {
        // Gallery doesn't display non-tileable attachments (e.g. links)
        if (! this.isTileableAttachment(oembed)) {
            return this;
        }
        var oembedView = TiledAttachmentListView.prototype.add.call(this, oembed);

        this.focus();

        return oembedView;
    };

    /**
     * Displays the focused attachment in the gallery, updates
     * page count/index, and prev/next button visibility.
     * @param oembed {Oembed} A Oembed instance to render in the View
     */
    GalleryAttachmentListView.prototype.focus = function (oembed) {
        if (!oembed && !this.oembedViews.length) {
            return;
        }
        oembed = oembed ? oembed : this._focusedAttachment || this.oembedViews[0].oembed;

        if ( ! this._focusedAttachment) {
            this.setFocusedAttachment(oembed);
        }

        // Render focused attachment
        var focusedAttachmentsEl = this.$el.find(this.focusedAttachmentsSelector);
        focusedAttachmentsEl.empty();

        var oembedView = new OembedView({ oembed: oembed });
        oembedView.render();
        var focusedEl = oembedView.$el.clone();
        focusedEl.appendTo(focusedAttachmentsEl);

        var photoContentEl = focusedEl.find('.content-attachment-photo');
        photoContentEl.addClass(this.focusedAttachmentClassName);
        if (this._focusedAttachment.type === 'video') {
            var playButtonEl = focusedEl.find('.content-attachment-controls-play');
            playButtonEl.hide();
            photoContentEl.hide().removeClass(this.focusedAttachmentClassName);
            var videoContentEl = focusedEl.find('.content-attachment-video');
            videoContentEl.addClass(this.focusedAttachmentClassName);
            videoContentEl.html(this._focusedAttachment.html);
            if (this.tile) {
                videoContentEl.find('iframe').css({'width': '100%', 'height': '100%'});
            }
            videoContentEl.show();
        }

        // Update page count and focused index
        var attachmentsCount = this.tileableCount();
        if (this.pageCount) {
            var newIndex = 0;
            for (var i=0; i < this.oembedViews.length; i++) {
                if (this.oembedViews[i].oembed === this._focusedAttachment) {
                    this.focusedIndex = newIndex;
                    break;
                }
                if (this.isTileableAttachment(this.oembedViews[i].oembed)) {
                    newIndex++;
                }
            }
            this.$el.find(this.galleryCurrentPageSelector).html(this.focusedIndex + 1);
            this.$el.find(this.galleryTotalPagesSelector).html(attachmentsCount);

            var galleryCountEl = this.$el.find(this.galleryCountSelector);
            
            if (attachmentsCount > 1) {
                galleryCountEl.show();
            } else {
                galleryCountEl.hide();
            }
        }

        // Prev/Next buttons
        if (attachmentsCount === 1) {
            this.$el.find(this.galleryPrevSelector).hide();
            this.$el.find(this.galleryNextSelector).hide();
        } else if (this.focusedIndex + 1 === attachmentsCount) {
            this.$el.find(this.galleryPrevSelector).show();
            this.$el.find(this.galleryNextSelector).hide();
        } else if (this.focusedIndex === 0) {
            this.$el.find(this.galleryPrevSelector).hide();
            this.$el.find(this.galleryNextSelector).show();
        } else {
            this.$el.find(this.galleryPrevSelector).show();
            this.$el.find(this.galleryNextSelector).show();
        }

        // Meta
        var contentMetaEl = this.$el.find(this.attachmentMetaSelector);
        contentMetaEl.html(contentBylineTemplate(this.content));

        // Update gallery size
        var self = this;
        var focusedAttachmentEl = this.$el.find('.'+this.focusedAttachmentClassName + '> *');
        if (!focusedAttachmentEl.length) {
            return;
        }
        if (focusedAttachmentEl[0].tagName === 'IMG') {
            focusedAttachmentEl.on('load', function(e) {
                self.resizeFocusedAttachment();
            });
        } else {
            this.resizeFocusedAttachment();
        }
    };

    /**
     * Resizes the focused attachment to fit within the content view
     */
    GalleryAttachmentListView.prototype.resizeFocusedAttachment = function() {
        // Set direct child of focused attachment to expand to itself
        var focusedAttachmentEl = this.$el.find('.'+this.focusedAttachmentClassName);
        focusedAttachmentEl.children().eq(0).width('100%').height('100%');

        this.$el.trigger('galleryResize.hub');
    };

    /**
     * Focuses the next attachment if it is not the last attachment
     */
    GalleryAttachmentListView.prototype.next = function() {
        var tileableIndex = 0;
        for (var i=0; i < this.oembedViews.length; i++) {
            if (!this.isTileableAttachment(this.oembedViews[i].oembed)) {
                continue;
            }
            if (this.focusedIndex+1 === tileableIndex) {
                this.focusedIndex = tileableIndex;
                this._focusedAttachment = this.oembedViews[i].oembed;
                this.render();
                break;
            }
            tileableIndex++;
        }
    };

    /**
     * Focuses the previous attachment if it is not the first attachment
     */
    GalleryAttachmentListView.prototype.prev = function() {
        var tileableIndex = 0;
        for (var i=0; i < this.oembedViews.length; i++) {
            if (!this.isTileableAttachment(this.oembedViews[i].oembed)) {
                continue;
            }
            if (this.focusedIndex-1 === tileableIndex) {
                this.focusedIndex = tileableIndex;
                this._focusedAttachment = this.oembedViews[i].oembed;
                this.render();
                break;
            }
            tileableIndex++;
        }
    };

    return GalleryAttachmentListView;
});
 
