var $ = require('streamhub-sdk/jquery');
var clone = require('mout/lang/clone');
var CollectionArchive = require('streamhub-sdk/collection/streams/archive');
var debug = require('streamhub-sdk/debug');
var inherits = require('inherits');
var QueryBootstrapClient = require('streamhub-sdk/collection/clients/query-bootstrap-client');

var log = debug('streamhub-sdk/collection/streams/archive-query');

/**
 * A Readable stream that uses filter query ids to get filtered results.
 * @param {Object} opts Configuration options.
 * @extends {CollectionArchive}
 */
function QueryCollectionArchive(opts) {
    // Only allowed to use the QueryBootstrapClient when using queries.
    opts.bootstrapClient = new QueryBootstrapClient({queries: opts.queries});
    CollectionArchive.call(this, opts);

    /**
     * Pagination cursor.
     * @type {?Object}
     * @private
     */
    this._cursor = null;

    /**
     * Whether this is the initial request or not.
     * @type {boolean}
     * @private
     */
    this._initial = true;

    /**
     * Whether the current sort order is descending or not.
     * @type {boolean}
     * @private
     */
    this._isDesc = this._comparator === CollectionArchive.comparators.CREATED_AT_DESCENDING;

    /**
     * Filter queries to use in order while fetching data.
     * @type {Array.<string>}
     * @private
     */
    this._queries = clone(opts.queries);

    /**
     * Query modifier for updating the sortOrder on the content.
     * @type {number}
     * @private
     */
    this._queryModifier = opts.queries.length;
}
inherits(QueryCollectionArchive, CollectionArchive);

/**
 * Overriding because the content sortOrder need to be tweaked to ensure that
 * the contents from the first query id show up on top.
 * @override
 */
QueryCollectionArchive.prototype._contentsFromBootstrapDoc = function (bootstrapDoc, opts) {
    (bootstrapDoc.content || []).forEach(function (content) {
        if (!content.content.sortOrder) {
            content.content.sortOrder = content.content.createdAt;
        }
        content.content.sortOrder += 10e12 * this._queryModifier;
        content.content.annotations.sortOrder = content.content.sortOrder;
    }.bind(this));
    return CollectionArchive.prototype._contentsFromBootstrapDoc.call(this, bootstrapDoc, opts);
};

/** @override */
QueryCollectionArchive.prototype._getBootstrapClientOptions = function () {
    var opts = CollectionArchive.prototype._getBootstrapClientOptions.call(this);
    opts.queryId = this._queries[0];
    $.extend(opts, this._getPagination());
    return opts;
};

/**
 * Overrides the CollectionArchive version to only return the sort order instead
 * of converting it to a date first which is problematic due to the query modifier
 * applied in the query version.
 * @override
 */
QueryCollectionArchive.prototype.getContentSortDate = function (content) {
    return content.sortOrder;
};

/**
 * Get the pagination cursor for the current request. The property in the
 * returned object is used to determine the sort order.
 * - max is descending
 * - min is ascending
 * @returns {Object}
 * @private
 */
QueryCollectionArchive.prototype._getPagination = function () {
    var cursor = this._cursor || {};
    var pagination = {};

    if (!cursor.next) {
        return pagination;
    }

    pagination[this._isDesc ? 'max' : 'min'] = cursor.next;
    return pagination;
};

/**
 * Determines if there is more data to fetch.
 * @returns {boolean}
 * @private
 */
QueryCollectionArchive.prototype._hasMore = function () {
    return this._queries && this._queries.length > 0;
};

/**
 * Processes the cursor received from the response and updates the queries list
 * and cursor. If the current query is used up, switches to the next one. If
 * there is more data, update the cursor.
 * @param {Object} paging The paging data from the response.
 * @private
 */
QueryCollectionArchive.prototype._processPagination = function (paging) {
    // If there is no more content in the current query, remove it from the
    // list and clear the cursor. If there are no more queries, we're done.
    if (!(paging || {}).hasMore) {
        this._queries.splice(0, 1);
        this._queryModifier--;
        this._cursor = null;
        return;
    }
    this._cursor = paging.cursors;
};

/** @override */
QueryCollectionArchive.prototype._read = function () {
    log('_read', 'Buffer length is ' + this._readableState.buffer.length);
    // If the next cursor is null, there is no more data.
    if (!this._hasMore()) {
        return this.push(null);
    }
    this._readNextPage();
};

/**
 * Overriding because we don't need to fetch init in this situation.
 * @override
 */
QueryCollectionArchive.prototype._readFirstPage = function () {
    this._readNextPage();
};

/** @override */
QueryCollectionArchive.prototype._readNextPage = function () {
    var self = this;
    var bootstrapClientOpts = this._getBootstrapClientOptions();

    this._bootstrapClient.getContent(bootstrapClientOpts, function (err, data) {
        if (err || !data) {
            var cursorError;
            if (bootstrapClientOpts.max) {
                cursorError = 'max: ' + bootstrapClientOpts.max;
            } else if (bootstrapClientOpts.min) {
                cursorError = 'min: ' + bootstrapClientOpts.min;
            }
            return self.emit('error', new Error('Error requesting queryId: ' +
                bootstrapClientOpts.queryId + ', cursor ' + cursorError));
        }

        var contents = self._contentsFromBootstrapDoc(data);
        self.push.apply(self, contents);
        self._processPagination(data.paging);

        // There was no content, so try to read again. If there is another
        // query, it will use that to fetch data. Otherwise, nothing will happen.
        // NOTE: This will only happen on the first read attempt.
        !contents.length && self._initial && self._read();
        self._initial = false;
    });
};

module.exports = QueryCollectionArchive;
