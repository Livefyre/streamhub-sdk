var ProductBlockView = require('streamhub-sdk/content/views/product-block-view');

describe('ProductBlockView', function () {
    var view;

    beforeEach(function () {
        view = new ProductBlockView({
            content: {id: 'abc', source: 'def'},
            product: {url: 'http://google.com'},
            productOptions: {analytics: {}}
        });
    });

    describe('.buildProductUrl', function () {
        it('does nothing if no analytics options are provided', function () {
            expect(view.buildProductUrl()).toEqual('http://google.com');
        });

        it('concatenates all analytics options to product url', function () {
            view.opts.productOptions.analytics = {
                cid: '123',
                another: 'something'
            };
            expect(view.buildProductUrl()).toEqual('http://google.com?cid=123&another=something');

            view.opts.product.url = 'http://google.com?one=two';
            expect(view.buildProductUrl()).toEqual('http://google.com?one=two&cid=123&another=something');
        });

        describe('does string replacements', function () {
            it('for {source} to have social provider', function () {
                view.opts.productOptions.analytics = {
                    cid: 'abc-{source}-123'
                };
                expect(view.buildProductUrl()).toEqual('http://google.com?cid=abc-def-123');
            });

            it('for {contentId} to include content id', function () {
                view.opts.productOptions.analytics = {
                    cid: 'abc-{contentId}-123'
                };
                expect(view.buildProductUrl()).toEqual('http://google.com?cid=abc-abc-123');
            });
        });
    });
});
