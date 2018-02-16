define(['inherits', 'streamhub-sdk/view', 'streamhub-sdk/i18n', 'streamhub-sdk/jquery'],
    function (inherits, View, i18n) {
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


        ShowMoreButton.prototype.events = View.prototype.events.extended({
            // Hide the button on click. When more content is held and can be shown,
            // It will reappear
            'click': function (e) {
                e.stopPropagation();
                this._holding = false;
                this.$el.hide();
                this.$el.trigger('showMore.hub');
            },
            'keyup': function (e) {
                // only when return or space
                if (e.which === 13 || e.which === 32) {
                    e.stopPropagation();
                    this._holding = false;
                    this.$el.hide();
                    this.$el.trigger('showMore.hub');
                }
            }
        });


        ShowMoreButton.prototype.render = function () {
            View.prototype.render.call(this);
            if (!this.isHolding()) {
                this.$el.css('display', 'none');
            }
        };


        /**
         * The template to render in the Button
         * @return {string}
         */
        ShowMoreButton.prototype.template = function () {
            return i18n.get('showMoreButtonText', 'Load More');
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
                self._holding = true;
                self.$el.css('display', '');
            });
        };


        ShowMoreButton.prototype.isHolding = function () {
            return this._holding;
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
