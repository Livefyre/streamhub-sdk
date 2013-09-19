define([
	'inherits',
	'streamhub-sdk/collection/clients/write-client'],
function (inherits, LivefyreWriteClient) {
    'use strict';


    var mockWriteResponse = {"status": "ok", "code": 200, "data": {"messages": [{"content": {"replaces": null, "bodyHtml": "<p>oh hi there 2</p>", "annotations": {"moderator": true}, "source": 0, "authorId": "system@labs-t402.fyre.co", "parentId": null, "mentions": [], "shareLink": "http://t402.livefyre.com/.fyreit/w9lbch.4", "id": "26394571", "createdAt": 1363808885}, "vis": 1, "type": 0, "event": null, "source": 0}], "authors": {"system@labs-t402.fyre.co": {"displayName": "system", "tags": [], "profileUrl": "", "avatar": "http://gravatar.com/avatar/e23293c6dfc25b86762b045336233add/?s=50&d=http://d10g4z0y9q0fip.cloudfront.net/a/anon/50.jpg", "type": 1, "id": "system@labs-t402.fyre.co"}}}};
    var mockWriteTweetResponse = {"status": "ok", "code": 200, "data": {"messages": [{"content": {"replaces": "", "bodyHtml": "MAITRE GIMS : \" Les feat dans SUBLIMINAL ces du tres lourd j'veut pas trop m'avanc\u00e9 mais sa seras du tres lourd \"feat avec EMINEM &amp; 50 CENT?", "annotations": {}, "authorId": "471544268@twitter.com", "parentId": "", "updatedAt": 1366839025, "mentions": [], "shareLink": "http://fyre.it/QE0B9G.4", "id": "tweet-308280235000995842@twitter.com", "createdAt": 1366839025}, "vis": 1, "source": 0, "replies": [], "type": 0, "event": null}], "authors": {"471544268@twitter.com": {"displayName": "twinsley yonkou VX", "tags": [], "profileUrl": "https://twitter.com/#!/TismeyJr", "avatar": "http://a0.twimg.com/profile_images/3339939516/bde222e341d477729170a326ca31204e_normal.jpeg", "type": 3, "id": "471544268@twitter.com"}}}};


	var MockLivefyreWriteClient = function () {
		LivefyreWriteClient.apply(this, arguments);
	};

	inherits(MockLivefyreWriteClient, LivefyreWriteClient);


	MockLivefyreWriteClient.prototype.postContent = function (opts, callback) {
		if (callback) {
            callback(null, mockWriteResponse);
        }
	};

	
	MockLivefyreWriteClient.prototype.postTweet = function (opts, callback) {
		if (callback) {
            callback(null, mockWriteTweetResponse);
        }
	};

    
    return MockLivefyreWriteClient;
});
