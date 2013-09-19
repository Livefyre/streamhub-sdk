define(['inherits', 'streamhub-sdk/view'],
function (inherits, View) {
    'use strict';

    /**
     * A View that provides a button that can control a More stream
     * @param opts {object}
     * @param [opts.more] {More} A More stream that this button should control
     */
    var ShowMoreButton = function (opts) {
        View.call(this, opts);
        opts = opts || {};
        if (opts.more) {
            this.setMoreStream(opts.more);
        }
    };

    inherits(ShowMoreButton, View);


    ShowMoreButton.prototype.render = function () {
        View.prototype.render.call(this);
        this.$el.hide();
    };


    /**
     * The template to render in the Button
     * @return {string}
     */
    ShowMoreButton.prototype.template = function () {
        return "Load More";
    };


    /**
     * Set the HTMLElement this Button should render in
     * @param element {HTMLElement} An element the button should render in
     */
    ShowMoreButton.prototype.setElement = function (element) {
        var self = this;
        View.prototype.setElement.apply(this, arguments);
        // Hide the button on click. When more content is held and can be shown,
        // It will reappear
        this.$el.on('click', function () {
            self.$el.hide();
            self.$el.trigger('showMore.hub');
        });
    };


    /**
     * Set the More Stream this button controls
     * @param more {More} A More stream that this button should control
     */
    ShowMoreButton.prototype.setMoreStream = function (more) {
        var self = this;

        this._more = more;

        // When more content is held to be shown, show the button
        this._more.on('hold', function () {
            self.$el.show();
        });
    };


    /**
     * Get the More Stream this button is controlling
     * @return {More}
     */
    ShowMoreButton.prototype.getMoreStream = function () {
        return this._more;
    };


    return ShowMoreButton;
});