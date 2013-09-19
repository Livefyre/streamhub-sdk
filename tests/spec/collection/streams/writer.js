define([
	'jasmine',
	'streamhub-sdk/content/content',
	'streamhub-sdk/collection/streams/writer',
	'streamhub-sdk-tests/mocks/collection/mock-collection',
	'streamhub-sdk-tests/mocks/collection/clients/mock-write-client',
	'streamhub-sdk/auth',
	'stream/writable'],
function (jasmine, Content, CollectionWriter, MockCollection,
MockLivefyreWriteClient, Auth, Writable) {
    'use strict';

	describe('streamhub-sdk/collection/streams/writer', function () {
		it('can be passed opts.collection on construction', function () {
			var collection = new MockCollection();
			var writer = new CollectionWriter({
				collection: collection
			});
			expect(writer instanceof CollectionWriter).toBe(true);
			expect(writer._collection).toBe(collection);
		});
		it('can be passed opts.writeClient on construction', function () {
			var collection = new MockCollection();
			var writeClient = {};
			var writer = new CollectionWriter({
				collection: collection,
				writeClient: writeClient
			});
			expect(writer instanceof CollectionWriter).toBe(true);
			expect(writer._collection).toBe(collection);
			expect(writer._writeClient).toBe(writeClient);
		});
		describe('instance', function () {
			var collection,
				writer;
			beforeEach(function () {
                var opts = {
                    network: 'test.fyre.co',
                    siteId: 'testSiteId',
                    articleId: 'testArticleId',
                    environment: 'test.livefyre.com'
                };
                collection = new MockCollection(opts);
				writer = new CollectionWriter({
					collection: collection,
					writeClient: new MockLivefyreWriteClient()
				});
			});
			it('is a Writable', function () {
				expect(writer instanceof Writable).toBe(true);
			});
			describe('.write()', function () {
	            beforeEach(function () {
	                spyOn(writer._writeClient, 'postContent').andCallThrough();
	                spyOn(writer._writeClient, 'postTweet').andCallThrough();
	            });

	            it('throws Auth.UnauthorizedError if a token is not set with streamhub-sdk/auth', function () {
	                expect(function () {
	                    writer.write(new Content('blah'));
	                }).toThrow(new Auth.UnauthorizedError("Collection cannot write until streamhub-sdk/auth.setToken has been called"));
	            });

	            describe('when a token is set with streamhub-sdk/auth', function () {
	                var token;
	                beforeEach(function () {
	                    token = '12345';
	                    Auth.setToken(token);
	                });
	                afterEach(function () {
	                    Auth.setToken();
	                });

	                it('can be called with Content', function () {
	                    expect(function () {
	                        writer.write(new Content('blah'));
	                    }).not.toThrow();
	                });

	                it('posts Content to the Collection via ._writer._writeClient.postContent', function () {
	                    writer.write(new Content('blah'));
	                    expect(writer._writeClient.postContent).toHaveBeenCalled();
	                });

	                it('posts Content with .tweetId via ._writer._writeClient.postTweet', function () {
	                    var content = new Content('ima tweet');
	                    content.tweetId = '377647689821077505';
	                    writer.write(content);
	                    expect(writer._writeClient.postTweet).toHaveBeenCalled();
	                });
	            });
			});
		});
	});
});