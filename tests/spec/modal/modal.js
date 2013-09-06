define([
    'streamhub-sdk/jquery',
    'jasmine',
    'jasmine-jquery',
    'streamhub-sdk/content/content',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/modal/modal'
], function($, jasmine, jasmineJquery, Content, Oembed, ModalView) {

    describe('ModalView', function() {

        describe('when constructed', function() {

            describe('with no arguments', function() {

                afterEach(function() {
                    $('body > .hub-modal').remove();
                });

                var modalView = new ModalView();
                it('is an instance of ModalView', function() {
                    expect(modalView instanceof ModalView).toBe(true);
                });

                it('has a .modalContentView', function () {
                    expect(modalView.modalContentView).toBeDefined();
                });
            });

            describe('with opts.createContentView', function () {

                afterEach(function() {
                    $('body > .hub-modal').remove();
                });

                var myCreateModalContentView = function () {};
                modalView = new ModalView({ createContentView: myCreateModalContentView });
                it('is an instance of ModalView', function() {
                    expect(modalView instanceof ModalView).toBe(true);
                });
                it('the ._createContentView method is the same as opts.createContentView', function() {
                    expect(modalView._createContentView).toBe(myCreateModalContentView);
                });
            });
        });

        describe('when focusing content', function () {
            var modalView;

            beforeEach(function () {
                modalView = new ModalView();
            });

            afterEach(function() {
                $('body > .hub-modal').remove();
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

        describe('when rendering', function () {

            var modalView;

            beforeEach(function() {
                modalView = new ModalView();
                modalView.render();
            });

            afterEach(function() {
                $('body > .hub-modal').remove();
            });

            it('has a close button', function() {
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
                modalView.show();
            });

            afterEach(function() {
                modalView.hide();
            });

            it('is appended as a direct child of ModalView.el', function() {
                expect(modalView.$el.parent()).toBe(ModalView.$el);
            });

            it('the .visible property is true', function() {
                modalView.show();
                expect(modalView.visible).toBe(true);
            });
        });

        describe('when hiding', function() {

            var modalView;

            beforeEach(function() {
                modalView = new ModalView();
                modalView.render();
            });

            afterEach(function() {
                modalView.hide();
                $('body > .hub-modal').remove();
            });

            it('the .visible property is false', function() {
                modalView.show();
                modalView.hide();
                expect(modalView.visible).toBe(false);
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
                    modalView.show();
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
                    modalView.show();
                    spyOn(modalView, 'hide').andCallThrough();
                    var $closeButtonEl = modalView.$el.find(modalView.closeButtonSelector);
                    $closeButtonEl.trigger('click');
                    expect(modalView.hide).toHaveBeenCalled();
                });
            });
        });
    });
});
