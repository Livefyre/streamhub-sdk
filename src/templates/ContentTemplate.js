define(function (require, exports) {

var Mustache = require('mustache'),
	ContentHtml = require('text!./Content.mustache'),
	ContentMustache = Mustache.compile(ContentHtml);

var ContentTemplate = function ContentTemplate (content) {
	return ContentMustache(content);
};

exports = ContentTemplate;
return exports;
});