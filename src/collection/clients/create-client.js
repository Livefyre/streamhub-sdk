define([
    'streamhub-sdk/collection/clients/http-client',
    'inherits'],
function(LivefyreHttpClient, inherits) {
    'use strict';

    /**
     * A Client for creating a Livefyre collection
     * @exports streamhub-sdk/collection/clients/create-client
     */
    var LivefyreCreateClient = function (opts) {
        opts = opts || {};
        opts.serviceName = 'quill';
        LivefyreHttpClient.call(this, opts);
    };

    inherits(LivefyreCreateClient, LivefyreHttpClient);

    /**
     * @callback createCollectionCallback
     * @param [error] {Object|string} 
     * @param [data] {Object}
     */
    
    /**
     * @typedef CollectionMeta {(Object|string)} This is an object or a token string
     *          (per https://github.com/Livefyre/livefyre-docs/wiki/StreamHub-Integration-Guide)
     *          that contains data required for creating a collection.
     * @property [title] {string} Optional title for the new collection.
     * @property url {string} Required when not signed. URL of the page creating the collection.
     * @property [tags] {Array.<string>} Optional list of tag names.
     */
    
    /**
     * Fetches data from the livefyre bootstrap service with the arguments given.
     * @param opts {Object} The livefyre collection options.
     * @param opts.network {string} The name of the network in the livefyre platform
     * @param opts.siteId {string} The livefyre siteId for the conversation
     * @param opts.articleId {string} The livefyre articleId for the conversation
     * @param [opts.environment] {string} Optional livefyre environment to use dev/prod environment
     * @param [opts.signed] {boolean} Specified true when collectionMeta is a token string.
     * @param [opts.checksum] {string} Required if collectionMeta is a token string.
     * @param opts.collectionMeta {CollectionMeta} The required meta for creating the collection
     * @param callback {createCollectionCallback} A callback that is called upon success/failure of the
     *     bootstrap request. Callback signature is "function(error, data)".
     */
    LivefyreCreateClient.prototype.createCollection = function(opts, callback) {
        callback = callback || function() {};
        var url = [
        //api/v3.0/site/<siteId>/collection/create
            this._getUrlBase(opts),
            '/api/v3.0/site/',
            opts.siteId,
            '/collection/create'
        ].join('');
        
        var collectionMeta = opts.collectionMeta;
        if (!collectionMeta) {
            throw 'User error: Missing collectionMeta.';
        }
        
        var postData = {
                'collectionMeta': collectionMeta
            };
        if (typeof(opts.signed) === 'boolean') {
            postData.signed = opts.signed;
        }
        if (!postData.signed) {
            postData.collectionMeta.articleId = opts.articleId;
            if (opts.collectionMeta.tags) {
                postData.collectionMeta.tags = opts.collectionMeta.tags.join(',');
            }
        }
        if (opts.checksum) {
            postData.checksum = opts.checksum;
        }
        postData = JSON.stringify(postData);

        this._request({
            method: 'POST',
            url: url,
            dataType: 'json',
            data: postData
        }, callback);
    };

    return LivefyreCreateClient;
});
