var $ = require('streamhub-sdk/jquery');
var debug = require('streamhub-sdk/debug');

var log = debug('streamhub-sdk/views/list-view');

var Sharer = function (opts) {
};

Sharer.prototype.delegate = function (delegate) {
    this._delegate = delegate;
};

Sharer.prototype.hasDelegate = function () {
    return !!this._delegate;
};

Sharer.prototype.share = function () {
    if ( ! this._delegate) {
        log('there is no share delegate');
        return;
    }
};

var sharer = module.exports = new Sharer();
