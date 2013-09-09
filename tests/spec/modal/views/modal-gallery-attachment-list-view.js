define([
    'jquery',
    'jasmine',
    'jasmine-jquery',
    'streamhub-sdk/content/content',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/modal/views/modal-gallery-attachment-list-view',
    'streamhub-sdk/content/views/oembed-view'],
function($, jasmine, jasminejQuery, Content, Oembed, ModalGalleryAttachmentListView, OembedView) {

    describe('ModalGalleryAttachmentListView', function () {
        var oembedAttachment = {
            provider_name: "Twimg",
            provider_url: "http://pbs.twimg.com",
            type: "photo",
            url: "http://pbs.twimg.com/media/BQGNgs9CEAEhmEF.jpg"
        };
        var content = new Content({ body: 'what' });

        it('has implemented the ._createContentView method', function () {
            expect(ModalGalleryAttachmentListView.prototype._createContentView).toBeDefined();
        });

        describe('when constructed', function () {

            describe('with no arguments or options', function () {
                var modalView = new ModalGalleryAttachmentListView();

                it('is instance of ModalGalleryAttachmentListView', function() {
                    expect(modalView).toBeDefined();
                    expect(modalView instanceof ModalGalleryAttachmentListView).toBe(true);
                });

                var modalView = new ModalGalleryAttachmentListView();
                it('is an instance of ModalGalleryAttachmentListView', function() {
                    expect(modalView instanceof ModalGalleryAttachmentListView).toBe(true);
                });

                it('has a .modalContentView', function () {
                    expect(modalView.modalContentView).toBeDefined();
                });
            });
        });

        describe('when focusing content', function () {
            var modalView;

            beforeEach(function () {
                modalView = new ModalGalleryAttachmentListView();
            });

            it('sets a content instance on the modal content view', function () {
                var content = new Content({ body: 'what' });
                modalView._setFocus(content);
                expect(modalView.modalContentView.content).toBe(content);
            });

            it('sets the focused attachment on the modal content view', function () {
                var content = new Content({ body: 'what' });
                var attachment = new Oembed();
                modalView._setFocus(content, { attachment: attachment });
                expect(modalView.modalContentView.content).toBe(content);
                expect(modalView.modalContentView._focusedAttachment).toBe(attachment);
            });
        });

        describe('when focusing a tiled video attachment', function () {
            var oembedVideoAttachment = {
                provider_name: "YouTube",
                provider_url: "http://youtube.com",
                type: "video",
                thumbnail_url: "http://pbs.twimg.com/media/BQGNgs9CEAEhmEF.jpg",
                html: "<iframe>here's your video player</iframe>"
            },
            modalView,
            tiledAttachmentEl,
            content;
           
            beforeEach(function() {
                content = new Content();
                modalView = new ModalGalleryAttachmentListView();
                modalView.setElement($('<div></div>'));
                modalView.show(content, { attachment: oembedVideoAttachment });

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
                tiledAttachmentEl.trigger('click');
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
                tiledAttachmentEl,
                content,
                attachmentListViewOpts;

            beforeEach(function() {
                content = new Content();
                modalView = new ModalGalleryAttachmentListView();
                modalView.setElement($('<div></div>'));
                modalView.show(content, { attachment: oembedAttachment });

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

