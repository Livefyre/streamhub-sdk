define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/util',
    'event-emitter',
    'inherits'
], function(
    $,
    Util,
    EventEmitter,
    inherits
) {
    'use strict';

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
        this.uid = Util.uniqueId();

        this.setElement(opts.el || document.createElement(this.elTag));
        this.delegateEvents();
    };
    inherits(View, EventEmitter);

    var delegateEventSplitter = /^(\S+)\s*(.*)$/;

    View.prototype.$ = function(selector) {
        return this.$el.find(selector);
    };

    /** The HTMLElement tag to use if this View creates its own element */
    View.prototype.elTag = 'div';

    View.prototype.elClass = '';

    /**
     * Set the element for the view to render in.
     * You will probably want to call .render() after this, but not always.
     * @param element {HTMLElement} The element to render this View in
     * @return this
     */
    View.prototype.setElement = function (element) {
        if (element instanceof $) {
            element = element[0];
        }
        this.el = element;
        this.$el = $(element);

        if (this.elClass) {
            this.$el.addClass(this.elClass);
        }

        return this;
    };

    /**
     * Attatch the declared events
     * @param events {Object.<string, (string|function)>} Mapping of event/selectors to a function
     * or the name of a method on this view.
     * Backbone.View style, e.g. { "click testSelector": "updateTestEl" }
     */
    View.prototype.delegateEvents = function (events) {
        if (!(events || (events = this.events))) {
            return this;
        }
        this.undelegateEvents();
        for (var key in events) {
            if (events.hasOwnProperty(key)) {
                var method = events[key];
                if (typeof method === 'string') {
                    method = this[method];
                }
                if (!method) {
                    throw "Undefined method for: " + key;
                }
                method = $.proxy(method, this);

                var match = key.match(delegateEventSplitter);
                if (!match) {
                    throw "Invalid event/selector pair: " + key;
                }
                var eventName = match[1];
                var selector = match[2];
                eventName += '.delegateEvents' + this.uid;
                if (selector === '') {
                    this.$el.on(eventName, method);
                } else {
                    this.$el.on(eventName, selector, method);
                }
            }
        }
        return this;
    };

    View.prototype.undelegateEvents = function() {
        this.$el.off('.delegateEvents' + this.uid);
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
     * The inverse of render. Detaches the element from the DOM.
     * Retains data and event handlers
     */
    View.prototype.detach = function () {
        this.$el.detach();
    };

    View.prototype.destroy = function () {
        this.$el.remove();
        this.template = null;
        this.undelegateEvents();
    };

    return View;
});
