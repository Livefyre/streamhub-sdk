define(function (require, exports, module) {

var ContentTemplate = require('../templates/ContentTemplate');

// Construct a ContentView
var ContentView = function ContentView (opts) {
	opts = opts || {};
	this.content = opts.content;
    this.setElement(opts.el || document.createElement(this.elTag));
};

ContentView.prototype.elTag = 'article';
ContentView.prototype.elClass = 'content';
ContentView.prototype.template = ContentTemplate;

 /**
 * Set the .el DOMElement that the ContentView should render to
 * @param el {DOMElement} The new element the ContentView should render to
 */
ContentView.prototype.setElement = function (el) {
    this.el = el;
    this.$el = $(el);
    this.$el.addClass(this.elClass);
    if (this.content && this.content.author && this.content.author.avatar) {

    }
    this.$el.attr('data-content-has-avatar',
    	(this.content && this.content.author && this.content.author.avatar)
    	? 'true'
    	: 'false');
};

// Render the content inside of the ContentView's element
ContentView.prototype.render = function () {
	this.el.innerHTML = this.template(this.getTemplateContext());
};

ContentView.prototype.getTemplateContext = function () {
	return this.content;
};

exports = ContentView;
return exports;
});