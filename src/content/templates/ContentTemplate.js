define(function (require, exports) {

var ContentHtml = require('hgn!./Content');

var ContentTemplate = function ContentTemplate (content) {
	return ContentHtml(content);
};

exports = ContentTemplate;
return exports;
});