define([
	'jasmine',
	'streamhub-sdk/collection',
	'streamhub-sdk/streams/collection-archive',
	'streamhub-sdk/streams/collection-updater'
], function (jasmine, Collection, CollectionArchive, CollectionUpdater) {
	describe('streamhub-sdk/collection', function () {
		it('is a function', function () {
			expect(Collection).toEqual(jasmine.any(Function));
		});
		describe('instance', function () {
			var opts,
				collection;
			beforeEach(function () {
				opts = {
					network: 'test.fyre.co',
					siteId: 'testSiteId',
					articleId: 'testArticleId',
					environment: 'test.livefyre.com'
				};
				collection = new Collection(opts);
			});

			it('has .network', function () {
				expect(collection.network).toBe(opts.network);
			});
			it('has .siteId', function () {
				expect(collection.siteId).toBe(opts.siteId);
			});
			it('has .articleId', function () {
				expect(collection.articleId).toBe(opts.articleId);
			});
			it('has .environment', function () {
				expect(collection.environment).toBe(opts.environment);
			});

			describe('.createArchive', function () {
				it('returns a readable CollectionArchive Stream', function () {
					var archive = collection.createArchive();
					expect(archive instanceof CollectionArchive).toBe(true);
				});
			});

			describe('.createUpdater', function () {
				it('returns a readable CollectionUpdater Stream', function () {
					var updater = collection.createUpdater();
					expect(updater instanceof CollectionUpdater).toBe(true);
				});
			});
		});
	});
});