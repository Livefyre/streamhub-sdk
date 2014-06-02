'use strict'
var inherits = require('inherits');
var LivefyrePermalinkClient = require('streamhub-sdk/collection/clients/permalink-client');

var MockLivefyrePermalinkClient = function (opts) {
    opts = opts || {};
    LivefyrePermalinkClient.apply(this, arguments);
};
inherits(MockLivefyrePermalinkClient, LivefyrePermalinkClient);


MockLivefyrePermalinkClient.prototype.getPermalink = function (opts, errback) {
    var response;
    response = (opts.environment) ? 'http://host.com/article/#collectionId:contentId' : 'http://fyre.it/obPcqD.4';
    errback(null, response);
};

module.exports MockLivefyrePermalinkClient;
