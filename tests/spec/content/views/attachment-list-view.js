define([
    'jquery',
    'jasmine',
    'jasmine-jquery',
    'streamhub-sdk/content/content',
    'streamhub-sdk/content/views/attachment-list-view',
    'streamhub-sdk/content/views/oembed-view'],
function($, jasmine, jasminejQuery, Content, AttachmentListView, OembedView) {
    'use strict';

    describe('AttachmentListView', function () {
        var oembedAttachment = {
            provider_name: "Twimg",
            provider_url: "http://pbs.twimg.com",
            type: "photo",
            url: "http://pbs.twimg.com/media/BQGNgs9CEAEhmEF.jpg"
        };
        var content = new Content({ body: 'what' });

        describe('when constructed', function() {

            describe('with no arguments or options', function() {
                var attachmentListView = new AttachmentListView();
                it('is instance of AttachmentListView', function() {
                    expect(attachmentListView).toBeDefined();
                    expect(attachmentListView instanceof AttachmentListView).toBe(true);
                });
            });

            describe('with opts.content', function() {
                var attachmentListView = new AttachmentListView({ content: content });
                it('is instance of AttachmentListView', function() {
                    expect(attachmentListView).toBeDefined();
                    expect(attachmentListView instanceof AttachmentListView).toBe(true);
                });
            });
        });

        describe('when adding an attachment', function() {

            it('increments the attachment count', function() {
                var attachmentListView = new AttachmentListView({ content: content });
                expect(attachmentListView.count()).toBe(0);
                attachmentListView.add(oembedAttachment);
                expect(attachmentListView.count()).toBe(1);
            });

            describe('creates an attachment view', function() {
                var attachmentListView = new AttachmentListView({ content: content });
                var oembedView = attachmentListView._createOembedView(oembedAttachment);
                it('is instance of OembedView', function() {
                    expect(oembedView).toBeDefined();
                    expect(oembedView instanceof OembedView).toBe(true);
                });
            });

            describe('with photo attachment', function() {
                var attachmentListView = new AttachmentListView({ content: content });
                attachmentListView.setElement($('<div></div>'));
                attachmentListView.render();
                oembedAttachment.type = 'photo';
                attachmentListView.add(oembedAttachment);

                it('is a stacked attachment (appended to .content-attachments-stacked)', function() {
                    expect(attachmentListView.$el.find('.content-attachments-stacked')).toContain('.content-attachment');
                });
            });

            describe('with video attachment', function() {
                var attachmentListView = new AttachmentListView({ content: content });
                attachmentListView.setElement($('<div></div>'));
                attachmentListView.render();
                oembedAttachment.type = 'video';
                attachmentListView.add(oembedAttachment);

                it('is a stacked attachment (appended to .content-attachments-stacked)', function() {
                    expect(attachmentListView.$el.find('.content-attachments-stacked')).toContain('.content-attachment');
                });
            });

            describe('with link attachment', function() {
                var attachmentListView = new AttachmentListView({ content: content });
                attachmentListView.setElement($('<div></div>'));
                attachmentListView.render();
                oembedAttachment.type = 'link';
                attachmentListView.add(oembedAttachment);

                it('is a stacked attachment (appended to .content-attachments-stacked)', function() {
                    expect(attachmentListView.$el.find('.content-attachments-stacked')).toContain('.content-attachment');
                });
            });

            describe('with rich attachment', function() {
                var attachmentListView = new AttachmentListView({ content: content });
                attachmentListView.setElement($('<div></div>'));
                oembedAttachment.type = 'rich';
                attachmentListView.render();
                attachmentListView.add(oembedAttachment);

                it('is a stacked attachment (appended to .content-attachments-stacked)', function() {
                    expect(attachmentListView.$el.find('.content-attachments-stacked')).toContain('.content-attachment');
                });
            });
        });

        describe('when removing an attachment', function() {

            it ('decrements the attachment count', function() {
                var attachmentListView = new AttachmentListView({ content: content });
                attachmentListView.render();
                attachmentListView.add(oembedAttachment);

                expect(attachmentListView.count()).toBe(1);
                attachmentListView.remove(oembedAttachment);
                expect(attachmentListView.count()).toBe(0);
            });

            describe('retrieves OembedView given an attachment', function() {
                var attachmentListView = new AttachmentListView({ content: content });
                attachmentListView.render();
                attachmentListView.add(oembedAttachment);

                it ('is corresponding OembedView of the attachment object', function() {
                    var oembedView = attachmentListView.getOembedView(oembedAttachment);
                    expect(oembedView === attachmentListView.oembedViews[0]).toBe(true);
                });
            });
        });

        describe('when rendering', function() {
        });

    });

});

