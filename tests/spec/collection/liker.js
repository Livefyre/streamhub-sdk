define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/auth',
    'streamhub-sdk/collection/liker',
    'streamhub-sdk/content'
], function ($, Auth, Liker, Content) {
    'use strict';

    describe('streamhub-sdk/collection/liker', function () {

        it('is a constructor', function () {
            expect(Liker).toEqual(jasmine.any(Function));
            expect(new Liker() instanceof Liker).toBe(true);
        });

        it('can be constructed with opts.writeClient', function () {
            var liker = new Liker({ writeClient: 'myWriteClient!' });
            expect(liker._writeClient).toBe('myWriteClient!');
        });

        describe('can like a content', function () {

            beforeEach(function () {
                Auth.setToken('eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJkb21haW4iOiAibGFicy10NDAyLmZ5cmUuY28iLCAiZXhwaXJlcyI6IDExMzkxNzI4ODEzLjAzOTY2LCAidXNlcl9pZCI6ICJkZW1vLTAifQ.ZJLrUcRf3MbgOqJ1tLO81pZ7ANfatsKgLie6T6S_Wi4');
            });
            afterEach(function () {
                Auth.setToken();
            });

            it('calls the write client #like', function () {
                var liker = new Liker();
                spyOn(liker._writeClient, 'like');
                var content = new Content();
                content.collection = {
                    network: 'networkId',
                    siteId: 'siteId',
                    collectionId: 'collectionId',
                    contentId: 'contentId'
                };
                liker.like(content);
                expect(liker._writeClient.like).toHaveBeenCalled();
            });
        });

        describe('can unlike a content', function () {

            beforeEach(function () {
                Auth.setToken('eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJkb21haW4iOiAibGFicy10NDAyLmZ5cmUuY28iLCAiZXhwaXJlcyI6IDExMzkxNzI4ODEzLjAzOTY2LCAidXNlcl9pZCI6ICJkZW1vLTAifQ.ZJLrUcRf3MbgOqJ1tLO81pZ7ANfatsKgLie6T6S_Wi4');
            });
            afterEach(function () {
                Auth.setToken();
            });

            it('calls the write client #unlike', function () {
                var liker = new Liker();
                spyOn(liker._writeClient, 'unlike');
                var content = new Content();
                content.collection = {
                    network: 'networkId',
                    siteId: 'siteId',
                    collectionId: 'collectionId',
                    contentId: 'contentId'
                };
                liker.unlike(content);
                expect(liker._writeClient.unlike).toHaveBeenCalled();
            });
        });
    });

});
