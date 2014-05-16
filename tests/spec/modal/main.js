define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/content',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/modal',
    'streamhub-sdk/content/views/gallery-attachment-list-view'
], function($, Content, Oembed, ModalView, GalleryAttachmentListView) {
    'use strict';

    describe('ModalView', function() {

        describe('when constructed', function() {

            describe('with no arguments', function() {

                var modalView = new ModalView();
                expect(modalView instanceof ModalView).toBe(true);
            });
        });

        describe('when DOM ready', function () {
            var modalView;

            beforeEach(function () {
                modalView = new ModalView({ modalSubView: new GalleryAttachmentListView() });
            });

            afterEach(function () {
                modalView.hide();
            });

            it('has inserted a container element as a direct child of body element', function () {
                $(document).trigger('ready');
                expect($('body > .hub-modals')).toBe('div');
            });
        });

        describe('when rendering', function () {

            var modalView;

            beforeEach(function() {
                modalView = new ModalView({ modalSubView: new GalleryAttachmentListView() });
                modalView.render();
            });

            afterEach(function () {
                modalView.hide();
            });

            it('has a close button', function () {
                var $closeButton = modalView.$el.find(modalView.closeButtonSelector);
                expect($closeButton.length).toBe(1);
            });

            it('has an element to contain the contentView of the modal', function() {
                var $contentViewEl = modalView.$el.find(modalView.containerElSelector);
                expect($contentViewEl.length).toBe(1);
            });
        });

        describe('when showing', function() {

            var modalView;

            beforeEach(function() {
                modalView = new ModalView();
                modalView.show(new GalleryAttachmentListView());
            });

            afterEach(function() {
                modalView.hide();
            });

            it('is appended as a direct child of ModalView.el', function() {
                expect(modalView.$el.parent()).toBe(ModalView.$el);
            });

            it('the .visible property is true', function() {
                modalView.show(new GalleryAttachmentListView());
                expect(modalView.visible).toBe(true);
            });

            it('the document body overflow is hidden', function () {
                expect($('body').css('overflow')).toEqual('hidden');
            });
        });

        describe('when showing stacked', function () {

            var anotherView;
            var anotherModalView;
            var modalView;
            var view;

            beforeEach(function() {
                view = new GalleryAttachmentListView();
                anotherView = new GalleryAttachmentListView();
                modalView = new ModalView();
                anotherModalView = new ModalView();

                modalView.show(view, true);
                anotherModalView.show(anotherView, true);
            });

            afterEach(function() {
                modalView.hide();
                anotherModalView.hide();
            });

            it('it shows the view at the top of the stack', function() {
                expect(anotherModalView.visible).toBeTruthy();
            });

            it('it hides the views not at the top of the stack', function() {
                expect(modalView.visible).not.toBeTruthy();
            });
        });


        describe('when hiding', function() {

            var modalView;

            beforeEach(function() {
                modalView = new ModalView({ modalSubView: new GalleryAttachmentListView() });
                modalView.render();
            });

            afterEach(function() {
                modalView.hide();
                $('body > .hub-modals').remove();
            });

            it('the .visible property is false', function() {
                modalView.show(new GalleryAttachmentListView());
                modalView.hide();
                expect(modalView.visible).toBe(false);
            });

            it('the document body overflow is auto', function () {
                expect($('body').css('overflow')).toEqual('auto');
            });
        });

        describe('when hiding stacked', function() {

            var anotherView;
            var anotherModalView;
            var modalView;
            var view;

            beforeEach(function() {
                view = new GalleryAttachmentListView();
                anotherView = new GalleryAttachmentListView();
                modalView = new ModalView();
                anotherModalView = new ModalView();

                modalView.show(view, true);
                anotherModalView.show(anotherView, true);
            });

            afterEach(function() {
                $('body > .hub-modals').remove();
            });


            it('it shows the next view on the stack', function() {
                anotherModalView.$el.trigger('hideModal.hub');
                expect(anotherModalView.visible).not.toBeTruthy();
                expect(modalView.visible).toBeTruthy();
            });
        });

        describe('when dismissing', function () {

            describe('with Escape key', function() {
                var modalView;

                beforeEach(function() {
                    modalView = new ModalView();
                });

                afterEach(function() {
                    modalView.hide();
                });

                it('hides the modal', function () {
                    modalView.show(new GalleryAttachmentListView());
                    spyOn(modalView, 'hide').andCallThrough();
                    $(window).trigger($.Event('keyup', { keyCode: 27 }));
                    expect(modalView.hide).toHaveBeenCalled();
                });
            });

            describe('with Close button', function() {
                var modalView;

                beforeEach(function() {
                    modalView = new ModalView();
                });

                afterEach(function() {
                    modalView.hide();
                });

                it('hides the modal', function () {
                    modalView.show(new GalleryAttachmentListView());
                    spyOn(modalView, 'hide').andCallThrough();
                    var $closeButtonEl = modalView.$el.find(modalView.closeButtonSelector);
                    $closeButtonEl.trigger('click');
                    expect(modalView.hide).toHaveBeenCalled();
                });
            });
        });
    });
});
