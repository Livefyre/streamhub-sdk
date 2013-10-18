define([
	'inherits',
	'streamhub-sdk-tests/mocks/collection/clients/mock-bootstrap-client',
	'streamhub-sdk-tests/mocks/collection/clients/mock-write-client',
	'streamhub-sdk/collection'],
function (inherits, MockLivefyreBootstrapClient, MockLivefyreWriteClient,
Collection) {
	'use strict';


	var MockCollection = function (opts) {
		opts = opts || {};
        opts.bootstrapClient = new MockLivefyreBootstrapClient({
            featuredInit: opts.withFeaturedInit
        });
		Collection.call(this, opts);
	};

	inherits(MockCollection, Collection);


	MockCollection.prototype.createWriter = function () {
		return Collection.prototype.createWriter({
			writeClient: new MockLivefyreWriteClient()
		});
	};


	return MockCollection;
});