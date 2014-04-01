define([
	'inherits',
	'streamhub-sdk-tests/mocks/collection/clients/mock-bootstrap-client',
	'streamhub-sdk-tests/mocks/collection/clients/mock-write-client',
	'streamhub-sdk-tests/mocks/collection/clients/mock-stream-client',
	'streamhub-sdk/collection'],
function (inherits, MockLivefyreBootstrapClient, MockLivefyreWriteClient,
MockLivefyreStreamClient, Collection) {
	'use strict';


	var MockCollection = function (opts) {
		opts = opts || {};
        opts.bootstrapClient = opts.bootstrapClient || new MockLivefyreBootstrapClient({
            featuredInit: opts.withFeaturedInit
        });
        opts.streamClient = new MockLivefyreStreamClient();
		Collection.call(this, opts);
	};

	inherits(MockCollection, Collection);


	MockCollection.prototype.createWriter = function () {
		return Collection.prototype.createWriter.call(this, {
			writeClient: new MockLivefyreWriteClient()
		});
	};


	MockCollection.prototype.createUpdater = function () {
		return Collection.prototype.createUpdater.call(this, {
			streamClient: new MockLivefyreStreamClient()
		});
	};



	return MockCollection;
});