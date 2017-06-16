var ProductCarouselView = require('streamhub-sdk/content/views/product-carousel-view');

describe('ProductCarouselView', function () {
    var opts;

    beforeEach(function () {
        opts = {
            cardsInView: 2,
            content: {
                links: {
                    product: [{
                        price: '$6.66',
                        title: 'a title',
                        url: 'http://google.com/product'
                    }]
                }
            },
            productOptions: {
                detail: {
                    photo: false,
                    price: true,
                    title: true
                },
                show: true
            }
        };
    });

    it('initializes', function () {
        var view = new ProductCarouselView(opts);
        expect(view instanceof ProductCarouselView).toBe(true);
        expect(view.cardsInView).toEqual(2);
        expect(view.products).toEqual(opts.content.links.product);
        expect(view.visibleIndex).toEqual(0);
    });

    describe('.hasMore', function () {
        it('checks if more on left', function () {
            var view = new ProductCarouselView(opts);
            expect(view.hasMore('left')).toBe(false);

            view.visibleIndex = 1;
            expect(view.hasMore('left')).toBe(true);
        });

        it('checks if more on right', function () {
            var view = new ProductCarouselView(opts);
            expect(view.hasMore('right')).toBe(false);

            view.products.push({title: 'title 2'});
            view.products.push({title: 'title 3'});
            expect(view.hasMore('right')).toBe(true);
        });

        it('changes as navigation occurs', function () {
            var view = new ProductCarouselView(opts);
            expect(view.hasMore('right')).toBe(false);

            view.products.push({title: 'title 2'});
            view.products.push({title: 'title 3'});
            expect(view.hasMore('right')).toBe(true);

            view.navigate(1);
            expect(view.hasMore('right')).toBe(false);
        });
    });

    describe('.navigate', function () {
        var spy;
        var view;

        beforeEach(function () {
            view = new ProductCarouselView(opts);
            view.products.push({title: 'title 1'});
            view.products.push({title: 'title 2'});
            view.products.push({title: 'title 3'});
            view.products.push({title: 'title 4'});
            view.products.push({title: 'title 5'});
            view.render();
            spy = spyOn(view, 'addViewToDOM').andCallThrough();
        });

        it('does nothing if new index is less than 0', function () {
            view.navigate(-1);
            expect(spy.callCount).toEqual(0);
        });

        it('does nothing if reached end of products', function () {
            view.visibleIndex = 4;
            view.navigate(1);
            expect(spy.callCount).toEqual(0);
        });

        it('updates the nav buttons', function () {
            expect(view.$el.find(view.leftSelector).hasClass(view.hideClass)).toBe(true);
            expect(view.$el.find(view.rightSelector).hasClass(view.hideClass)).toBe(false);
            view.navigate(1);
            expect(view.$el.find(view.leftSelector).hasClass(view.hideClass)).toBe(false);
            view.navigate(-1);
            expect(view.$el.find(view.leftSelector).hasClass(view.hideClass)).toBe(true);
            view.navigate(1);
            view.navigate(1);
            view.navigate(1);
            view.navigate(1);
            expect(view.$el.find(view.rightSelector).hasClass(view.hideClass)).toBe(true);
        });

        describe('left', function () {
            it('removes the right-most view and prepends a new one', function () {
                view.navigate(1);
                var products = view.$el.find('.product-name');
                expect(products[0].innerHTML).toEqual('title 1');
                expect(products[1].innerHTML).toEqual('title 2');
                view.navigate(-1);
                products = view.$el.find('.product-name');
                expect(products[0].innerHTML).toEqual('a title');
                expect(products[1].innerHTML).toEqual('title 1');
            });
        });

        describe('right', function () {
            it('removes the left-most view and appends a new one', function () {
                var products = view.$el.find('.product-name');
                expect(products[0].innerHTML).toEqual('a title');
                expect(products[1].innerHTML).toEqual('title 1');
                view.navigate(1);
                products = view.$el.find('.product-name');
                expect(products[0].innerHTML).toEqual('title 1');
                expect(products[1].innerHTML).toEqual('title 2');
            });
        });
    });

    describe('.render', function () {
        it('adds no products if none are available', function () {
            opts.content.links.product = [];
            var view = new ProductCarouselView(opts);
            var spy = spyOn(view, 'addViewToDOM');
            view.render();
            expect(spy.callCount).toEqual(0);
            expect(view.$el.find(view.leftSelector).hasClass(view.hideClass)).toBe(true);
            expect(view.$el.find(view.rightSelector).hasClass(view.hideClass)).toBe(true);
        });

        it('adds initial products to the DOM', function () {
            var view = new ProductCarouselView(opts);
            var spy = spyOn(view, 'addViewToDOM');
            view.render();
            expect(spy.callCount).toEqual(1);
            expect(view.$el.find(view.leftSelector).hasClass(view.hideClass)).toBe(true);
            expect(view.$el.find(view.rightSelector).hasClass(view.hideClass)).toBe(true);
        });

        it('adds multiple initial products', function () {
            opts.content.links.product.push({title: 'title 2'});
            opts.content.links.product.push({title: 'title 3'});
            var view = new ProductCarouselView(opts);
            var spy = spyOn(view, 'addViewToDOM');
            view.render();
            expect(spy.callCount).toEqual(2);
            expect(view.$el.find(view.leftSelector).hasClass(view.hideClass)).toBe(true);
            expect(view.$el.find(view.rightSelector).hasClass(view.hideClass)).toBe(false); 
        });
    });

    describe('.updateNavigationButtons', function () {
        it('toggles nav button based on `hasMore`', function () {
            var view = new ProductCarouselView(opts);
            var spy = spyOn(view, 'hasMore').andReturn(false);
            view.render();
            expect(view.$el.find(view.leftSelector).hasClass(view.hideClass)).toBe(true);
            expect(view.$el.find(view.rightSelector).hasClass(view.hideClass)).toBe(true);
            spy.andCallFake(function (dir) {
                return dir === 'left';
            });
            view.updateNavigationButtons();
            expect(view.$el.find(view.leftSelector).hasClass(view.hideClass)).toBe(false);
            expect(view.$el.find(view.rightSelector).hasClass(view.hideClass)).toBe(true);
        });
    });
});
