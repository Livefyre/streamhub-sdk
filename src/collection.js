define([
	'streamhub-sdk/streams/collection-archive',
	'streamhub-sdk/streams/collection-updater'],
function (CollectionArchive, CollectionUpdater) {
	/**
	 * An Object that represents a hosted StreamHub Collection
	 */
	function Collection (opts) {
		this.network = opts.network;
		this.siteId = opts.siteId;
		this.articleId = opts.articleId;
		this.environment = opts.environment;
	}


	/**
	 * Create a readable stream that will read through the Collection Archive
	 * The Collection Archive contains older Content in the Collection
	 * @returns {streamhub-sdk/streams/collection-archive}
	 */
	Collection.prototype.createArchive = function () {
		return new CollectionArchive({
			network: this.network,
			siteId: this.siteId,
			articleId: this.articleId,
			environment: this.environment
		});
	};


	/**
	 * Create a Readable Stream that will stream any new updates to the
	 * collection like additions, removals, edits, etc.
	 */
	Collection.prototype.createUpdater = function () {
		return new CollectionUpdater({
			network: this.network,
			siteId: this.siteId,
			articleId: this.articleId,
			environment: this.environment	
		});
	};


	return Collection;
});