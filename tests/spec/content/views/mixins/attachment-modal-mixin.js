var AttachmentGalleryModal = require('streamhub-sdk/modal/views/attachment-gallery-modal');
var Content = require('streamhub-sdk/content');
var ContentView = require('streamhub-sdk/content/views/content-view');
var GalleryAttachmentListView = require('streamhub-sdk/content/views/gallery-attachment-list-view');
var hasAttachmentModal = require('streamhub-sdk/content/views/mixins/attachment-modal-mixin');
var ListView = require('streamhub-sdk/views/list-view');
var ModalContentCardView = require('streamhub-sdk/content/views/modal-content-card-view');
var ModalView = require('streamhub-sdk/modal');

'use strict';

describe('hasAttachmentModal mixin', function () {
    var content;
    var contentView;
    var contentListView;

    it('adds the focusContent.hub handler for a ListView', function () {
        content = new Content({ body: 'hi' });
        listView = new ListView();
        hasAttachmentModal(listView);
        listView.add(new ContentView({ content: content }));
        expect(listView.events['focusContent.hub']).not.toBe(undefined);
    });

    it('can be mixed into a ContentView and handles focusContent.hub event', function () {
        contentView = new ContentView({ content: content });
        hasAttachmentModal(contentView);
        expect(contentView.events['focusContent.hub']).not.toBe(undefined);
    });

    it('takes `useNewModal` option to use the new modal class', function () {
        var modal = new ModalView();
        var spy = spyOn(modal, 'show');
        content = new Content({ body: 'hi' });
        contentView = new ContentView({ content: content });
        hasAttachmentModal(contentView, {
            modal: modal,
            productOptions: {show: true},
            useNewModal: true
        });
        contentView.$el.trigger('focusContent.hub', {content: content});
        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].args[0] instanceof ModalContentCardView).toBe(true);
        expect(spy.calls[0].args[0].opts.productOptions).toEqual({show: true});
    });

    it('does default action without `useNewModal` option', function () {
        var modal = new AttachmentGalleryModal();
        var spy = spyOn(modal, 'show');
        content = new Content({ body: 'hi' });
        contentView = new ContentView({ content: content });
        hasAttachmentModal(contentView, {modal: modal});
        contentView.$el.trigger('focusContent.hub', {content: content});
        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].args[0] instanceof GalleryAttachmentListView).toBe(true);
    });
});
