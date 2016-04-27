define([
    'jquery',
    'streamhub-sdk/content',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/content/views/gallery-attachment-list-view',
    'streamhub-sdk/modal/views/attachment-gallery-modal'],
function($, Content, Oembed, GalleryAttachmentListView, AttachmentGalleryModal) {
    'use strict';

    describe('AttachmentGalleryModal', function () {
        var oembedAttachment = {
            provider_name: "Twimg",
            provider_url: "http://pbs.twimg.com",
            type: "photo",
            url: "http://pbs.twimg.com/media/BQGNgs9CEAEhmEF.jpg"
        };

        describe('when constructed', function () {

            describe('with no arguments or options', function () {
                var modalView;

                beforeEach(function () {
                    modalView = new AttachmentGalleryModal();
                });

                it('is instance of AttachmentGalleryModal', function() {
                    expect(modalView).toBeDefined();
                    expect(modalView instanceof AttachmentGalleryModal).toBe(true);
                });
            });
        });

        describe('when showing content', function () {
            var modalView;
            var content;

            beforeEach(function () {
                content = new Content();
                modalView = new AttachmentGalleryModal();
                modalView.setElement($('<div></div>'));
            });

            it('sets a content instance on the modal content view', function () {
                modalView.show(new GalleryAttachmentListView({ content: content }));
                expect(modalView._modalSubView.content).toBe(content);
            });

            it('sets the focused attachment on the modal content view', function () {
                var attachment = new Oembed();
                modalView.show(new GalleryAttachmentListView({
                    content: content,
                    attachmentToFocus: attachment
                }));
                expect(modalView._modalSubView.content).toBe(content);
                expect(modalView._modalSubView._focusedAttachment).toBe(attachment);
            });
        });

        describe('when focusing a tiled video attachment', function () {
            var oembedVideoAttachment = {
                provider_name: "YouTube",
                provider_url: "http://youtube.com",
                type: "video",
                thumbnail_url: "http://pbs.twimg.com/media/BQGNgs9CEAEhmEF.jpg",
                html: "<iframe>here's your video player</iframe>"
            };
            var modalView;
            var tiledAttachmentEl;
            var content;

            beforeEach(function() {
                content = new Content();
                modalView = new AttachmentGalleryModal();
                modalView.setElement($('<div></div>'));
                modalView.show(new GalleryAttachmentListView({
                    content: content,
                    attachmentToFocus: oembedVideoAttachment
                }));

                for (var i=0; i < 4; i++) {
                    var attachment = $.extend({}, oembedVideoAttachment);
                    attachment.id = i;
                    content.addAttachment(attachment);
                }
                tiledAttachmentEl = modalView.$el.find('.content-attachment:first');
            });

            afterEach(function () {
                modalView.hide();
            });

            it('shows the video player as the focused attachment', function() {
                var focusedAttachmentsEl = modalView.$el.find('.content-attachments-gallery');
                var focusedVideoAttachmentEl = focusedAttachmentsEl.find('.content-attachment:first .content-attachment-video');
                expect(focusedVideoAttachmentEl).not.toBeEmpty();
                expect(focusedVideoAttachmentEl).toBe('div');
                expect(focusedVideoAttachmentEl).toHaveClass('content-attachments-focused');
                expect(focusedVideoAttachmentEl).toHaveClass('content-attachment-video');
            });
        });

        describe('when attachment is focused', function() {
            var modalView,
                content;

            beforeEach(function() {
                content = new Content();
                modalView = new AttachmentGalleryModal();
                modalView.setElement($('<div></div>'));
                modalView.show(new GalleryAttachmentListView({
                    content: content,
                    attachmentToFocus: oembedAttachment
                }));

                oembedAttachment.type = 'photo';
                for (var i=0; i < 3; i++) {
                    var attachment = $.extend({}, oembedAttachment);
                    attachment.id = i;
                    content.addAttachment(attachment);
                }
            });

            afterEach(function () {
                modalView.hide();
            });

            it('the focused element displayed', function() {
                expect(modalView.$el.find('.content-attachments-gallery-focused')).toBe('div');
            });
        });

    });

});

