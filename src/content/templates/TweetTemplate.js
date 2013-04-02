define(function (require, exports) {

var TweetMustache = require('hgn!./Tweet');

var TweetTemplate = function TweetTemplate (content) {
	return TweetMustache(content);
};

exports = TweetTemplate;
return exports;
});