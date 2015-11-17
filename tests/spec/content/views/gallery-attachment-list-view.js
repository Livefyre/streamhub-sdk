define([
    'jquery',
    'jasmine-jquery',
    'streamhub-sdk/content',
    'streamhub-sdk/content/views/gallery-attachment-list-view',
    'streamhub-sdk/content/views/oembed-view'],
function($, jasmineJquery, Content, GalleryAttachmentListView) {
    'use strict';

    describe('GalleryAttachmentListView', function () {
        var oembedAttachment = {
            provider_name: "Twimg",
            provider_url: "http://pbs.twimg.com",
            type: "photo",
            url: "http://pbs.twimg.com/media/BQGNgs9CEAEhmEF.jpg"
        };
        var content = new Content({ body: 'what' });

        describe('when constructed', function() {

            describe('with no arguments or options', function() {
                var galleryAttachmentListView = new GalleryAttachmentListView();
                it('is instance of GalleryAttachmentListView', function() {
                    expect(galleryAttachmentListView).toBeDefined();
                    expect(galleryAttachmentListView instanceof GalleryAttachmentListView).toBe(true);
                });
            });

            describe('with opts.content', function() {
                var galleryAttachmentListView = new GalleryAttachmentListView({ content: content });
                it('is instance of GalleryAttachmentListView', function() {
                    expect(galleryAttachmentListView).toBeDefined();
                    expect(galleryAttachmentListView instanceof GalleryAttachmentListView).toBe(true);
                });
            });

            describe('with opts.pageButtons', function() {
                var galleryAttachmentListView = new GalleryAttachmentListView({ pageButtons: true });
                it('is instance of GalleryAttachmentListView', function() {
                    expect(galleryAttachmentListView).toBeDefined();
                    expect(galleryAttachmentListView instanceof GalleryAttachmentListView).toBe(true);
                });
            });

            describe('with opts.thumbnails', function() {
                var galleryAttachmentListView = new GalleryAttachmentListView({ thumbnails: true });
                it('is instance of GalleryAttachmentListView', function() {
                    expect(galleryAttachmentListView).toBeDefined();
                    expect(galleryAttachmentListView instanceof GalleryAttachmentListView).toBe(true);
                });
            });

            describe('with opts.pageCount', function() {
                var galleryAttachmentListView = new GalleryAttachmentListView({ pageCount: true });
                it('is instance of GalleryAttachmentListView', function() {
                    expect(galleryAttachmentListView).toBeDefined();
                    expect(galleryAttachmentListView instanceof GalleryAttachmentListView).toBe(true);
                });
            });
        });

        describe('when rendering', function() {

            it('focuses the specified attachment', function() {
                var content = new Content();
                var galleryAttachmentListView = new GalleryAttachmentListView({ content: content, attachmentToFocus: oembedAttachment });
                content.addAttachment(oembedAttachment);
                galleryAttachmentListView.render();
                expect(galleryAttachmentListView.$el.find('.content-attachments-gallery-focused')).toBe('div');
            });

            describe('with pageButtons', function() {
                var galleryAttachmentListView = new GalleryAttachmentListView({ pageButtons: true });
                galleryAttachmentListView.render();

                it('has prev and next buttons in the modal', function() {
                    expect(galleryAttachmentListView.$el.find('.content-attachments-gallery-prev')).toBe('div');
                    expect(galleryAttachmentListView.$el.find('.content-attachments-gallery-next')).toBe('div');
                });
            });

            describe('with thumbnails', function() {
                var galleryAttachmentListView = new GalleryAttachmentListView({ thumbnails: true });
                galleryAttachmentListView.render();

                it('has thumbnails for each attachment of the content', function() {
                    expect(galleryAttachmentListView.$el.find('.content-attachments-gallery-thumbnails')).toBe('div');
                });
            });

            describe('with pageCount', function() {
                var galleryAttachmentListView = new GalleryAttachmentListView({ pageCount: true });
                galleryAttachmentListView.render();

                it('has a page count (e.g. "1 of 5")', function() {
                    expect(galleryAttachmentListView.$el.find('.content-attachments-gallery-count')).toBe('div');
                });
            });
        });

        describe('when clicking a thumbnail', function() {
            var galleryAttachmentListView,
                content = new Content(),
                attachmentListViewOpts = { content: content, attachmentToFocus: oembedAttachment};

            it('emits focusContent.hub event', function() {
                galleryAttachmentListView = new GalleryAttachmentListView(attachmentListViewOpts);
                galleryAttachmentListView.setElement($('<div></div>'));
                galleryAttachmentListView.render();
                oembedAttachment.type = 'photo';
                for (var i=0; i < 3; i++) {
                    var attachment = $.extend({}, oembedAttachment);
                    attachment.id = i;
                    content.addAttachment(attachment);
                }
                var thumbnailAttachmentEl = galleryAttachmentListView.$el.find('.content-attachments-gallery-thumbnails .content-attachment:first');

                var spyFocusAttachmentEvent = spyOnEvent(thumbnailAttachmentEl[0], 'focusContent.hub');
                var tileClicked = false;
                galleryAttachmentListView.$el.on('focusContent.hub', function() {
                    tileClicked = true;
                });

                thumbnailAttachmentEl.trigger('click');
                expect(tileClicked).toBe(true);
                expect(spyFocusAttachmentEvent).toHaveBeenTriggered();
            });
        });

        describe ('when focusing a tiled video attachment', function() {
            var oembedVideoAttachment = {
                provider_name: "YouTube",
                provider_url: "http://youtube.com",
                type: "video",
                thumbnail_url: "http://pbs.twimg.com/media/BQGNgs9CEAEhmEF.jpg",
                html: "<iframe src='http://video.source.html'>here's your video player</iframe>"
            },
            noAutoplayVideoAttachment = {
                provider_name: "Vimeo",
                provider_url: "http://youtube.com",
                type: "video",
                thumbnail_url: "http://pbs.twimg.com/media/BQGNgs9CEAEhmEF.jpg",
                html: "<iframe src='http://video.source.html'>here's your video player</iframe>"
            },
            galleryAttachmentListView,
            tiledAttachmentEl,
            content;

            beforeEach(function() {
                content = new Content();
                galleryAttachmentListView = new GalleryAttachmentListView({ content: content, attachmentToFocus: oembedVideoAttachment });

                galleryAttachmentListView.setElement($('<div></div>'));
                galleryAttachmentListView.render();
                for (var i=0; i < 4; i++) {
                    var attachment = $.extend({}, oembedVideoAttachment);
                    attachment.id = i;
                    content.addAttachment(attachment);
                }
                tiledAttachmentEl = galleryAttachmentListView.$el.find('.content-attachment:first');
            });

            it('shows the video player as the focused attachment and auto plays youtube', function() {
                tiledAttachmentEl.trigger('click');
                var focusedAttachmentsEl = galleryAttachmentListView.$el.find('.content-attachments-gallery');
                var focusedVideoAttachmentEl = focusedAttachmentsEl.find('.content-attachment:first .content-attachment-video');
                expect(focusedVideoAttachmentEl).not.toBeEmpty();
                expect(focusedVideoAttachmentEl).toBe('div');
                expect(focusedVideoAttachmentEl).toHaveClass('content-attachments-focused');
                expect(focusedVideoAttachmentEl).toHaveClass('content-attachment-video');
                expect(focusedVideoAttachmentEl).toHaveCss({ display: 'block' });
                expect($(focusedVideoAttachmentEl).find('iframe').attr('src')).toContain('autoplay=1');
            });

            it('does not auto play non Youtube and Livefyre videos', function() {
                content = new Content();
                galleryAttachmentListView = new GalleryAttachmentListView({ content: content, attachmentToFocus: noAutoplayVideoAttachment });

                galleryAttachmentListView.setElement($('<div></div>'));
                galleryAttachmentListView.render();
                for (var i=0; i < 4; i++) {
                    var attachment = $.extend({}, noAutoplayVideoAttachment);
                    attachment.id = i;
                    content.addAttachment(attachment);
                }
                tiledAttachmentEl = galleryAttachmentListView.$el.find('.content-attachment:first');
                tiledAttachmentEl.trigger('click');
                var focusedAttachmentsEl = galleryAttachmentListView.$el.find('.content-attachments-gallery');
                var focusedVideoAttachmentEl = focusedAttachmentsEl.find('.content-attachment:first .content-attachment-video');
                expect(focusedVideoAttachmentEl).not.toBeEmpty();
                expect(focusedVideoAttachmentEl).toBe('div');
                expect(focusedVideoAttachmentEl).toHaveClass('content-attachments-focused');
                expect(focusedVideoAttachmentEl).toHaveClass('content-attachment-video');
                expect(focusedVideoAttachmentEl).toHaveCss({ display: 'block' });
                expect($(focusedVideoAttachmentEl).find('iframe').attr('src')).not.toContain('autoplay=1');
            });
        });

        describe('when attachment is focused', function() {
            var galleryAttachmentListView,
                content,
                attachmentListViewOpts;

            beforeEach(function() {
                content = new Content();
                attachmentListViewOpts = { content: content, attachmentToFocus: oembedAttachment };
                galleryAttachmentListView = new GalleryAttachmentListView(attachmentListViewOpts);
                galleryAttachmentListView.setElement($('<div></div>'));
                galleryAttachmentListView.render();
                oembedAttachment.type = 'photo';
                for (var i=0; i < 3; i++) {
                    var attachment = $.extend({}, oembedAttachment);
                    attachment.id = i;
                    content.addAttachment(attachment);
                }
            });

            it('the focused element displayed', function() {
                expect(galleryAttachmentListView.$el.find(galleryAttachmentListView.focusedAttachmentsSelector)).toBe('div');
            });

            it('displays the next attachment when right arrow key is pressed', function() {
                spyOn(galleryAttachmentListView, 'next');
                $(window).trigger($.Event('keyup', {keyCode: 39}));
                expect(galleryAttachmentListView.next).toHaveBeenCalled();
            });

            it('displays the next attachment when next button is clicked', function() {
                spyOn(galleryAttachmentListView, 'next');
                galleryAttachmentListView.$el.find(galleryAttachmentListView.galleryNextSelector).trigger('click');
                expect(galleryAttachmentListView.next).toHaveBeenCalled();
            });

            it('displays the next attachment when the focused attachment is clicked', function() {

            });

            it('displays the previous attachment when left arrow key is pressed', function() {
                spyOn(galleryAttachmentListView, 'prev');
                $(window).trigger($.Event('keyup', {keyCode: 37}));
                expect(galleryAttachmentListView.prev).toHaveBeenCalled();

            });

            it('displays the previous attachment when previous button is clicked', function() {
                spyOn(galleryAttachmentListView, 'prev');
                galleryAttachmentListView.$el.find(galleryAttachmentListView.galleryPrevSelector).trigger('click');
                expect(galleryAttachmentListView.prev).toHaveBeenCalled();
            });

            describe('when there is 1 attachment', function () {
            });

            describe('when there is > 1 attachment', function () {
            });
        });

    });

});

