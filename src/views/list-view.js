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
     * @param opts.streams {Object.<string, Stream>} A dictionary of streams to listen to
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
        this._insertContentView(newContentView);
        this.emit('insert', newContentView);
        return newContentView;
    };

    /**
     * Insert a ContentView into the .el of the ListView
     * @todo Use comparator-based insertion
     */
    ListView.prototype._insertContentView = function (contentView) {
        $(contentView.el).prependTo(this.$el);
    };

    /**
     * Construct a ContentView for a piece of Content in the ListView
     * @default Construct by passing `content` to `this.getContentView(content)`
     */
    ListView.prototype.createContentView = function (content) {
        var CV = this.getContentView(content),
            contentView = new CV({
                content: content
            });
        return contentView;
    };

    /**
     * Get the function to use to construct Views for each content
     * `.createContentView`'s default implementation calls this to get the final View constructor
     * @default `.getContentViewConstructor` and extend the prototype to use <li> and a fancy .elClass
     */
    ListView.prototype.getContentView = function (content) {
        var CV = this.getContentViewConstructor(content);
        CV.prototype = $.extend(CV.prototype, {
            elTag: 'li',
            elClass: 'content-list-item ' + ContentView.prototype.elClass
        });
        return CV;
    };

    /**
     * Get the View constructor for a piece of content
     * `.getContentView`'s default implementation calls this for a constructor and then
     *     extends the prototype
     * @default return this.contentView
     */
    ListView.prototype.getContentViewConstructor = function (content) {
        return this.contentView;
    };
    /**
     * The View to use to render ListView content items. `.getContentiewConstructor`'s default
     *     implementation returns this value
     */
    ListView.prototype.contentView = ContentView;



    return ListView;
});