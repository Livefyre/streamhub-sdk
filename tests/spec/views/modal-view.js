define([
    'streamhub-sdk/jquery',
    'jasmine',
    'jasmine-jquery',
    'streamhub-sdk/content/content',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/views/modal-view'
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
            });

            describe('with opts.modal', function () {

                afterEach(function() {
                    $('body > .hub-modal').remove();
                });

                var myCreateModalContentView = function () {};
                modalView = new ModalView({ modal: myCreateModalContentView });
                it('is an instance of ModalView', function() {
                    expect(modalView instanceof ModalView).toBe(true);
                });
                it('the ._createModalContentView method is the same as opts.modal', function() {
                    expect(modalView._createModalContentView).toBe(myCreateModalContentView);
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

            it('creates an instance of the modal content view if it does not exist', function () {
                var content = new Content({ body: 'what' });
                expect(modalView.modalContentView).toBe(undefined);
                modalView.setFocus(content);
                expect(modalView.modalContentView).not.toBe(undefined);
            });

            it('sets a content instance on the modal content view', function () {
                var content = new Content({ body: 'what' });
                modalView.setFocus(content);
                expect(modalView.modalContentView.content).toBe(content);
            });

            it('sets the focused attachment on the modal content view', function () {
                var content = new Content({ body: 'what' });
                var attachment = new Oembed();
                modalView.setFocus(content, { attachment: attachment });
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

            it('is appended as a direct child of body element', function() {
                expect($('body > .hub-modal')).toBe('div');
            });

            it('has a close button', function() {
                expect($('body > .hub-modal .hub-modal-close')).toBe('div');
            });

            it('has an element to contain the content of the modal', function() {
                expect($('body > .hub-modal .hub-modal-content')).toBe('div');
            });
        });

        describe('when showing', function() {

            var modalView;

            beforeEach(function() {
                modalView = new ModalView();
                modalView.render();
            });

            afterEach(function() {
                modalView.hide();
                $('body > .hub-modal').remove();
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
                    modalView.render();
                });

                afterEach(function() {
                    modalView.hide();
                    $('body > .hub-modal').remove();
                });

                it('hides the modal', function () {
                    modalView.show();
                    spyOn(modalView, 'hide');
                    $(window).trigger($.Event('keyup', { keyCode: 27 }));
                    expect(modalView.hide).toHaveBeenCalled();
                });
            });

            describe('with Close button', function() {
                var modalView;

                beforeEach(function() {
                    modalView = new ModalView();
                    modalView.render();
                });

                afterEach(function() {
                    modalView.hide();
                    $('body > .hub-modal').remove();
                });

                it('hides the modal', function () {
                    modalView.show();
                    spyOn(modalView, 'hide');
                    var closeButtonEl = $('body > .hub-modal .hub-modal-close');
                    closeButtonEl.trigger('click');
                    expect(modalView.hide).toHaveBeenCalled();
                });
            });
        });
    });
});
