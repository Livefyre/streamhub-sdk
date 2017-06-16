var $ = require('jquery');
var Content = require('streamhub-sdk/content');
var i18n = require('streamhub-sdk/i18n');
var LivefyreContent = require('streamhub-sdk/content/types/livefyre-content');
var ModalContentCardView = require('streamhub-sdk/content/views/modal-content-card-view');
var util = require('streamhub-sdk/util');

'use strict';

describe('Default modal content card view', function () {
    describe('when constructed', function () {
        it('has a .createdAt Date', function () {
            var modalView = new ModalContentCardView({
                content: new Content('blah'),
                productOptions: {detail: {photo: true, price: true, title: true}, show: false}
            });
            expect(modalView.createdAt instanceof Date).toBe(true);
        });
    });

    describe('when image attachment loads', function() {
        var content = new Content({ body: 'what' });
        content.addAttachment({
            provider_name: 'Twimg',
            provider_url: 'http://pbs.twimg.com',
            type: 'photo',
            url: 'http://pbs.twimg.com/media/BQGNgs9CEAEhmEF.jpg'
        });
        var modalView = new ModalContentCardView({
            content: content,
            productOptions: {detail: {photo: true, price: true, title: true}, show: false}
        });
        modalView.render();

        it('has .content-with-image', function() {
            expect(modalView.$el.html()).toContain('content-attachment-photo');
        });
    });

    describe('when products load', function() {
        var content = new Content({ body: 'what' });
        content.links = {
            product: [{
                oembed: {url: 'http://www.hallmark.com/dw/image/v2/AALB_PRD/on/demandware.static/-/Sites-hallmark-master/default/dwdc14a30c/images/finished-goods/itty-bittys-My-Little-Pony-Rainbow-Dash-Stuffed-Animal-root-1KDD1252_KDD1252_1470_1.jpg_Source_Image.jpg?sw=625&sh=625&sm=fit'},
                price: '$6.95',
                title: 'itty bittys® My Little Pony™ Rainbow Dash Stuffed Animal',
                url: 'http://www.hallmark.com/gifts/stuffed-animals/itty-bittys/itty-bittys-my-little-pony-rainbow-dash-stuffed-animal-1KDD1252.html',
                urn: 'urn:livefyre:qa-blank.fyre.co:product=a012b658-4ced-452a-8a6a-108bb1c99879'
            }]
        };
        content.addAttachment({
            provider_name: 'Twimg',
            provider_url: 'http://pbs.twimg.com',
            type: 'photo',
            url: 'http://pbs.twimg.com/media/BQGNgs9CEAEhmEF.jpg'
        });

        it('has products', function() {
            spyOn(content, 'hasProducts').andReturn(true);
            spyOn(content, 'hasRightsGranted').andReturn(true);
            var modalView = new ModalContentCardView({
                content: content,
                productOptions: {detail: {photo: true, price: true, title: true}, show: true}
            });
            modalView.render();
            expect(modalView.$el.html()).toContain('product-carousel');
            expect(modalView.$el.html()).toContain('buy-button');
            expect(modalView.$el.html()).toContain('product-media');
            expect(modalView.$el.html()).toContain('product-name');
            expect(modalView.$el.html()).toContain('product-price');
        });

        it('don\'t show products', function() {
            spyOn(content, 'hasProducts').andReturn(true);
            spyOn(content, 'hasRightsGranted').andReturn(true);
            var modalView = new ModalContentCardView({
                content: content,
                productOptions: {detail: {photo: true, price: true, title: true}, show: false}
            });
            modalView.render();
            expect(modalView.$el.html().indexOf('product-carousel') === -1).toBe(true);
        });

        it('shows product header', function() {
            spyOn(content, 'hasProducts').andReturn(true);
            spyOn(content, 'hasRightsGranted').andReturn(true);
            i18n.set('productCarouselTitleText', 'Product List');
            var modalView = new ModalContentCardView({
                content: content,
                productOptions: {detail: {photo: false, price: false, title: true}, show: true}
            });
            modalView.render();
            expect(modalView.$el.html()).toContain('Product List');
            expect(modalView.$el.html()).toContain('product-carousel-header');
        });

        it('don\'t show product image', function() {
            spyOn(content, 'hasProducts').andReturn(true);
            spyOn(content, 'hasRightsGranted').andReturn(true);
            var modalView = new ModalContentCardView({
                content: content,
                productOptions: {detail: {photo: false, price: true, title: true}, show: true}
            });
            modalView.render();
            expect(modalView.$el.html().indexOf('product-media') === -1).toBe(true);
            expect(modalView.$el.html()).toContain('product-name');
            expect(modalView.$el.html()).toContain('product-price');
        });

        it('don\'t show product price', function() {
            spyOn(content, 'hasProducts').andReturn(true);
            spyOn(content, 'hasRightsGranted').andReturn(true);
            var modalView = new ModalContentCardView({
                content: content,
                productOptions: {detail: {photo: true, price: false, title: true}, show: true}
            });
            modalView.render();
            expect(modalView.$el.html()).toContain('product-media');
            expect(modalView.$el.html()).toContain('product-name');
            expect(modalView.$el.html().indexOf('product-price') === -1).toBe(true);
        });

        it('don\'t show product title', function() {
            spyOn(content, 'hasProducts').andReturn(true);
            spyOn(content, 'hasRightsGranted').andReturn(true);
            var modalView = new ModalContentCardView({
                content: content,
                productOptions: {detail: {photo: true, price: true, title: false}, show: true}
            });
            modalView.render();
            expect(modalView.$el.html()).toContain('product-media');
            expect(modalView.$el.html().indexOf('product-name') === -1).toBe(true);
            expect(modalView.$el.html()).toContain('product-price');
        });

        it('customize buy button label', function() {
            spyOn(content, 'hasProducts').andReturn(true);
            spyOn(content, 'hasRightsGranted').andReturn(true);
            i18n.set('productButtonText', 'Buy This');
            var modalView = new ModalContentCardView({
                content: content,
                productOptions: {detail: {photo: false, price: false, title: false}, show: true}
            });
            modalView.render();
            expect(modalView.$el.html()).toContain('buy-button');
            expect(modalView.$el.html()).toContain('Buy This');
        });
    });
});
