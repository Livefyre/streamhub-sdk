var inherits = require('inherits');
var LivefyreHttpClient = require('streamhub-sdk/collection/clients/http-client');

'use strict';

var POST_REGEX = /\/p\/[a-zA-Z0-9-_]*\/$/i;

/**
 * Instagram http client.
 * @constructor
 * @extends {LivefyreHttpClient}
 * @param [opts] {object}
 */
function InstagramClient(opts) {
    LivefyreHttpClient.call(this, opts);
};
inherits(InstagramClient, LivefyreHttpClient);

/**
 * Fetches oembed data for an instagram post by url
 * @param url {!string} URL of the post (e.g. https://www.instagram.com/p/BrN-skinM8W/)
 * @param callback {function} Callback that is called upon success/failure.
 *     Callback signature is "function(error, data)".
 */
InstagramClient.prototype.getOembed = function(url, callback) {
    // Ensure the url is valid for the endpoint
    if (!POST_REGEX.test(url)) {
        return callback(true);
    }
    this._request({url: 'https://api.instagram.com/oembed/?url=' + url}, callback, 4);
};

module.exports = InstagramClient;
