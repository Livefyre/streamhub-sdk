define(function (require, exports) {

var Mustache = require('mustache'),
	TweetMustache = require('text!./Tweet.mustache'),
	TweetMustacheCompiled = Mustache.compile(TweetMustache);

var TweetTemplate = function TweetTemplate (content) {
	return TweetMustacheCompiled(content);
};

exports = TweetTemplate;
return exports;
});