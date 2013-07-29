define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/event-emitter',
    'streamhub-sdk/util',
    'streamhub-sdk/content/content',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-twitter-content',
    'streamhub-sdk/content/types/livefyre-facebook-content',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/content/types/twitter-content',
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/content/views/twitter-content-view',
    'streamhub-sdk/content/views/facebook-content-view'
], function(
    $,
    EventEmitter,
    Util,
    Content,
    LivefyreContent,
    LivefyreTwitterContent,
    LivefyreFacebookContent,
    Oembed,
    TwitterContent,
    ContentView,
    TwitterContentView,
    FacebookContentView
) {

    /**
     * Defines a base view object that can be bound to any number of stream-managers. Content is
     * passed into a view via "add" event on "this". Subclasses are responsible for listening to
     * the "add" events and using them to display streamed content.
     * @param opts {Object} A set of options to config the view with
     * @param opts.streams {Object.<string, Stream>} A dictionary of streams to listen to
     * @param opts.el {HTMLElement} The element in which to render the streamed content
     * @param opts.contentRegistry {Array.<Object>} An optional content registry to use in this
     * view instance.
     * @exports streamhub-sdk/view
     * @constructor
     */
    var View = function(opts) {
        EventEmitter.call(this);
        opts = opts || {};
        this.opts = opts;

        this.setElement(opts.el || document.createElement(this.elTag));
        this.contentRegistry = opts.contentRegistry || View.DEFAULT_REGISTRY.slice(0);
        this.initialize.apply(this, arguments);
    };
    $.extend(View.prototype, EventEmitter.prototype);

    /** The HTMLElement tag to use if this View creates its own element */
    View.prototype.elTag = 'div';

    /**
     * Set the element for the view to render in.
     * You will probably want to call .render() after this, but not always.
     * @param element {HTMLElement} The element to render this View in
     * @return this
     * @param
     */
    View.prototype.setElement = function (element) {
        this.el = element;
        this.$el = $(element);
        return this;
    };

    /**
     * If a template is set, render it in this.el
     * Subclasses will want to setElement on child views after rendering,
     *     then call .render() on those subelements
     */
    View.prototype.render = function () {
        if (typeof this.template === 'function') {
            this.el.innerHTML = this.template(this);
        }
    };

    /**
     * The default registry for Content -> ContentView rendering.
     * Expects entries to always contain a "type" property, and either a view property
     * (the type function itself) or a viewFunction property (a function that returns a
     * type function, useful for conditional view selection.).
     */
    View.DEFAULT_REGISTRY = [
        { type: LivefyreTwitterContent, view: TwitterContentView },
        { type: LivefyreFacebookContent, view: FacebookContentView },
        { type: TwitterContent, view: TwitterContentView },
        { type: LivefyreContent, view: ContentView },
        { type: Content, view: ContentView }
    ];
    /**
     * Create an extended subclass of View
     * @param prototypeExtension {Object} Properties to add to the subclass's prototype
     */
    View.extend = Util.extend;

    /**
     * Initializes the View after construction. Subclasses can implement this
     */
    View.prototype.initialize = function () {};

    /**
     * Add a piece of Content to the View. Subclasses should implement this
     * @param content {Content} A Content instance to render in the View
     * @returns {ContentView} By convention, .add should return any new ContentView created to render the content
     */
    View.prototype.add = function(content) { return null; };

    /**
     * Creates a content view from the given piece of content, by looking in this view's
     * content registry for the supplied content type.
     * @param content {Content} A content object to create the corresponding view for.
     * @returns {ContentView} A new content view object for the given piece of content.
     */
    View.prototype.createContentView = function(content) {
        for (var i in this.contentRegistry) {
            var current = this.contentRegistry[i];
            
            if (content instanceof current.type) {
                var currentType;
                
                if (current.view) {
                    currentType = current.view;
                } else if (current.viewFunction) {
                    currentType = current.viewFunction(content);
                }
                return new currentType({content:content});
            }
        }
    };
    return View;
});