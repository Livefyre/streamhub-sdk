'use strict'
var LivefyreHttpClient = require('streamhub-sdk/collection/clients/http-client');
var inherits = require('inherits');

/**
 * A Client for requesting Livefyre permalinks
 * @exports streamhub-sdk/collection/clients/permalink-client
 */
var LivefyrePermalinkClient = function (opts) {
    opts = opts || {};
    opts.serviceName = 'bootstrap';
    LivefyreHttpClient.call(this, opts);
};
inherits(LivefyrePermalinkClient, LivefyreHttpClient);

LivefyrePermalinkClient.prototype._serviceName = 'bootstrap';

/**
 * Get a permalink for a specific comment.
 * @param opts {Object} Options to help build URL.
 * @param opts.collectionId {string}
 * @param opts.messageId {string}
 * @param {function()} callback
 */
LivefyrePermalinkClient.prototype.getPermalink = function (opts, callback) {
    var self = this;

    if (!this._isProdEnvironment(opts.environment)) {
    //Permalinks generated by the backend service only work in the
    //production environment. Create the link here for non-prod.
        var rgx = /(^|&)lf-content=[^&]*/gi,
            param = 'lf-content',
            value = [opts.environment, opts.collectionId, opts.messageId].join(':'),
            pieces = document.location.href.split("#"),
            url = pieces[0],
            fragment = pieces[1];

            if (fragment) {
                fragment = fragment.replace(rgx, '');
                if (fragment.length > 0) {
                    fragment = fragment.replace(rgx, '');
                    //Check for & at the front and remove it
                    if (fragment.charAt(0) === '&') {
                        fragment = fragment.slice(1);
                    }

                    fragment += '&' + [param, value].join('=');
                }
            } else {
                fragment = [param, value].join('=')
            }

        callback(undefined, self._adaptPermalink({
            data: {
                url: [url, fragment].join('#')
            }
        }));
        return;
    }
    var clbk = function (err, data) {
        callback(err, self._adaptPermalink(data));
    };
    this._request({
        data: {
            collection_id: opts.collectionId
        },
        url: this._getMessageUrl(opts, '/permalink/')
    }, clbk);
};

/**
 * Get a message URL.
 * @param opts {Object} Options to help build URL.
 * @param opts.messageId {string}
 * @param postfix {string} Remainder of URL to add at the end.
 * @return {string}
 * @private
 */
LivefyrePermalinkClient.prototype._getMessageUrl = function (opts, postfix) {
    var url = [
        this._getUrlBase(opts),
        '/api/v3.0/message/',
        opts.messageId
    ].join('');
    return url + postfix;
};

/**
 * Adapt the successful response into a permalink string
 * @protected
 */
LivefyrePermalinkClient.prototype._adaptPermalink = function (opt_data) {
    if (!opt_data || !opt_data.data) {
        return null;
    }
    var permalink = opt_data.data.url;
    if (permalink.search(/http[s]*:\/\//) !== 0) {//http:// or https://
        permalink = 'http://' + permalink;
    }
    return permalink;
};

module.exports = LivefyrePermalinkClient;
