define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/event-emitter',
    'streamhub-sdk/util'
], function(
    $,
    EventEmitter,
    util
) {

    /**
     * Defines a base view object that can be bound to any number of stream-managers. Content is
     * passed into a view via "add" event on "this". Subclasses are responsible for listening to
     * the "add" events and using them to display streamed content.
     * @param opts {Object} A set of options to config the view with
     * @param opts.streams {Object.<string, Stream>} A dictionary of streams to listen to
     * @param opts.el {HTMLElement} The element in which to render the streamed content
     * view instance.
     * @exports streamhub-sdk/view
     * @constructor
     */
    var View = function(opts) {
        EventEmitter.call(this);
        opts = opts || {};
        this.opts = opts;

        this.setElement(opts.el || document.createElement(this.elTag));
    };
    util.inherits(View, EventEmitter);

    /** The HTMLElement tag to use if this View creates its own element */
    View.prototype.elTag = 'div';

    /**
     * Set the element for the view to render in.
     * You will probably want to call .render() after this, but not always.
     * @param element {HTMLElement} The element to render this View in
     * @return this
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
            this.$el.html(this.template(this));
        }
    };

    /**
     * Add a piece of Content to the View. Subclasses should implement this
     * @param content {Content} A Content instance to render in the View
     * @returns {ContentView} By convention, .add should return any new ContentView created to render the content
     */
    View.prototype.add = function(content) { return null; };

    return View;
});
