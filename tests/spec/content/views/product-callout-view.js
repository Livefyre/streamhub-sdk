var i18n = require('streamhub-sdk/i18n');
var Popover = require('streamhub-ui/popover');
var ProductCalloutView = require('streamhub-sdk/content/views/product-callout-view');

describe('ProductCalloutView', function () {
    beforeEach(function () {
        i18n.reset();
    });

    it('renders nothing if products are not configured to show', function () {
        var view = new ProductCalloutView({productOptions: {show: false}});
        view.render();
        expect(view.$el.html()).toEqual('');
    });

    it('renders nothing if there is not product indication text', function () {
        i18n.set('productIndicationText', ' ');
        view = new ProductCalloutView({productOptions: {show: true}});
        view.render();
        expect(view.$el.html()).toEqual('');
    });

    it('renders the button if enabled and has copy', function () {
        var view = new ProductCalloutView({productOptions: {show: true}});
        view.render();
        expect(view.$el.html().trim()).toEqual('<span class="product-shop-button">Shop</span>');

        i18n.set('productIndicationText', '');
        view = new ProductCalloutView({productOptions: {show: true}});
        view.render();
        expect(view.$el.html().trim()).toEqual('<span class="product-shop-button">Shop</span>');

        i18n.set('productIndicationText', 'blah');
        var view = new ProductCalloutView({productOptions: {show: true}});
        view.render();
        expect(view.$el.html().trim()).toEqual('<span class="product-shop-button">blah</span>');
    });

    describe('ProductPopover', function() {
        beforeEach(function() {
            $(document.body).find('#popover-div').remove();
        });

        it('creates a popover', function() {
            var view = new ProductCalloutView({productOptions: {show: true}, popoverEnabled: true});
            view.render();
            view.$el.find('.product-shop-button').mouseover();
            expect($(document.body).find('.lf-product-popover').length).toEqual(1);
        });

        it('creates a popover only once', function () {
            var spy = spyOn(Popover.prototype, 'setContentNode').andCallThrough();
            var view = new ProductCalloutView({productOptions: {show: true}, popoverEnabled: true});
            view.render();
            view.$el.find('.product-shop-button').mouseover();
            expect(spy.callCount).toEqual(1);
            view.$el.find('.product-shop-button').mouseover();
            expect(spy.callCount).toEqual(1);
        });

        it('does not create a popover if popover disabled', function() {
            var view = new ProductCalloutView({productOptions: {show: true}, popoverEnabled: false});
            view.render();
            view.$el.find('.product-shop-button').mouseover();
            expect($(document.body).find('.lf-product-popover').length).toEqual(0);
        });

        it('does not create a popover if no popover setting defined', function() {
            var view = new ProductCalloutView({productOptions: {show: true}});
            view.render();
            view.$el.find('.product-shop-button').mouseover();
            expect($(document.body).find('.lf-product-popover').length).toEqual(0);
        });

        it('maintains a popover if mouseover on product popover', function() {
            var view = new ProductCalloutView({productOptions: {show: true}, popoverEnabled: true});
            view.render();
            view.$el.find('.product-shop-button').mouseover();
            expect($(document.body).find('.lf-product-popover').length).toEqual(1);
            view.$el.find('.lf-product-popover').mouseover();
            expect($(document.body).find('.lf-product-popover').length).toEqual(1);
        });

        it('removes a popover if mouseleave product callout view', function() {
            var view = new ProductCalloutView({productOptions: {show: true}, popoverEnabled: true});
            view.render();
            view.$el.find('.product-shop-button').mouseover();
            expect($(document.body).find('.lf-product-popover').length).toEqual(1);
            view.$el.mouseleave();

            waits(200);
            runs(function () {
                expect($(document.body).find('.lf-product-popover').length).toEqual(0);
            });            
        });

        it('removes a popover if mouseleave on product popover', function() {
            var view = new ProductCalloutView({productOptions: {show: true}, popoverEnabled: true});
            view.render();
            view.$el.find('.product-shop-button').mouseover();
            expect($(document.body).find('.lf-product-popover').length).toEqual(1);
            view.$el.mouseleave();
            view.popover.$el.mouseover();
            waits(200);
            runs(function() {
                expect($(document.body).find('.lf-product-popover').length).toEqual(1);
                view.popover.$el.mouseleave();
                expect($(document.body).find('.lf-product-popover').length).toEqual(0);
            });
        });
    });
});
