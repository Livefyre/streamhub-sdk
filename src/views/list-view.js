/** 
 * A module to render lists of Content
 * @module streamhub-sdk/views/list-view
 */
define(['jquery', 'streamhub-sdk/view', 'streamhub-sdk/content/views/content-view'],
function($, View, ContentView) {
    
    /**
     * A simple View that displays Content in a list (`<ul>` by default).
     * @alias module:streamhub-sdk/views/list-view
     * @param opts {Object} A set of options to config the view with
     * @param opts.el {HTMLElement} The element in which to render the streamed content
     * @constructor
     */
    var ListView = function(opts) {
        opts = opts || {};
        View.call(this, opts);

        this.setElement(opts.el || document.createElement(this.elTag));
        this.contentViews = [];

        var self = this;
        self.on('add', function(content, stream) {
            self.add(content, stream);
        });
    };
    $.extend(ListView.prototype, View.prototype);

    // Used if ListView needs to create its own DOMElement
    ListView.prototype.elTag = 'ul';
    ListView.prototype.elClass = 'content-list';

    /**
     * Set the .el DOMElement that the View should render to. Creates internal .el and
     *    .$el properties and adds this.elClass
     * @param el {DOMElement} The new element the View should render to
     */
    ListView.prototype.setElement = function (el) {
        this.el = el;
        this.$el = $(el);
        this.$el.addClass(this.elClass);
        // Insert base, static HTML
    };

    /**
     * Add a piece of Content to the ListView
     *     .createContentView(content)
     *     add newContentView to this.contentViews[]
     *     render the newContentView
     *     insert the newContentView into this.el
     * @param content {Content} A Content model to add to the ListView
     * @return the newly created ContentView
     */
    ListView.prototype.add = function(content, stream) {
        var newContentView = this.createContentView(content);

        this.contentViews.push(newContentView);
        newContentView.render();

        $(newContentView.el).prependTo(this.$el);

        return newContentView;
    };

    return ListView;
});