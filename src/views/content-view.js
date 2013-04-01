define(function (require, exports, module) {

var ContentTemplate = require('../templates/ContentTemplate');

// Construct a ContentView
var ContentView = function ContentView (opts) {
	this.content = opts.content;
	this.el = opts.el;
};

ContentView.prototype.template = ContentTemplate;

// Render the content inside of the ContentView's element
ContentView.prototype.render = function () {
	this.el.innerHTML = this.template(this.content);
};

exports = ContentView;
return exports;
});