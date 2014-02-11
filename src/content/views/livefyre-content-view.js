define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/auth',
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-opine',
    'streamhub-sdk/ui/button/hub-button',
    'streamhub-sdk/ui/button/hub-toggle-button',
    'streamhub-sdk/collection/liker',
    'hgn!streamhub-sdk/content/templates/content',
    'streamhub-sdk/util',
    'inherits',
    'streamhub-sdk/debug'
], function ($, Auth, ContentView, LivefyreContent, LivefyreOpine, HubButton, HubToggleButton, Liker, ContentTemplate, util, inherits, debug) {
    'use strict';

    var LIKE_REQUEST_LISTENER = false;

    /**
     * Defines the base class for all content-views. Handles updates to attachments
     * and loading of images.
     *
     * @param opts {Object} The set of options to configure this view with.
     * @param opts.content {Content} The content object to use when rendering. 
     * @param opts.el {?HTMLElement} The element to render this object in.
     * @fires LivefyreContentView#removeContentView.hub
     * @exports streamhub-sdk/content/views/content-view
     * @constructor
     */
    var LivefyreContentView = function LivefyreContentView (opts) {
        opts = opts || {};

        this._controls = {
            'left': [],
            'right': []
        };
        this._rendered = false;

        ContentView.call(this, opts);

        if (this.content) {
            this.content.on("opine", function(content) {
                this._renderButtons();
            }.bind(this));
            this.content.on("removeOpine", function(content) {
                this._renderButtons();
            }.bind(this));
        }
    };
    inherits(LivefyreContentView, ContentView);

    LivefyreContentView.prototype.footerLeftSelector = '.content-footer-left';
    LivefyreContentView.handleLikeClick = function (e, content) {
        var liker = new Liker();
        var userUri = Auth.getUserUri();

        if (! content.isLiked(userUri)) {
            liker.like(content, function () {
                $('body').trigger('contentLike.hub');
            });
        } else {
            liker.unlike(content, function () {
                $('body').trigger('contentUnlike.hub');
            });
        }
    };

    /**
     * Render the content inside of the LivefyreContentView's element.
     * @returns {LivefyreContentView}
     */
    LivefyreContentView.prototype.render = function () {
        ContentView.prototype.render.call(this);
        this._renderButtons();
        return this;
    };

    LivefyreContentView.prototype._handleLikeClick = function () {
        // Lazily attach event handler for contentLike
        if (! LIKE_REQUEST_LISTENER) {
            var self = this;
            $('body').on('contentLike.hub contentUnlike.hub', function () {
                self._renderButtons();
            });
            $('body').on('likeClick.hub', LivefyreContentView.handleLikeClick);
            LIKE_REQUEST_LISTENER = true;
        }

        this.$el.trigger('likeClick.hub', this.content);
    };

    LivefyreContentView.prototype._handleShare = function () {
        this.$el.trigger('contentShare.hub', this.content);
    };

    LivefyreContentView.prototype._renderButtons = function () {
        this.$el.find(this.footerLeftSelector).empty();

        if (! (this.content instanceof LivefyreContent)) {
            return;
        }
        var likeCount = this.content.getLikeCount();
        var likeButton = new HubToggleButton(this._handleLikeClick.bind(this), {
            className: 'hub-content-like',
            on: this.content.isLiked(Auth.getUserUri()), //TODO(ryanc): Get user id from auth
            label: likeCount
        });
        this.addButton(likeButton);

        //TODO(ryanc): Wait until we have replies on SDK
        //var replyCommand = new Command(function () {
        //    self.$el.trigger('contentReply.hub');
        //});
        //var replyButton = new HubButton(replyCommand, {
        //    className: 'hub-btn-link hub-content-reply',
        //    label: 'Reply'
        //});
        //this.addButton(replyButton);

        //TODO(ryanc): Wait until we have likes finished first
        //var shareButton = new HubButton(this._handleShare.bind(this), {
        //    className: 'hub-btn-link hub-content-share',
        //    label: 'Share'
        //});
        //this.addButton(shareButton);
    };

    LivefyreContentView.prototype.addButton = function (button) {
        for (var i=0; i < this._controls.left.length; i++) {
            if (this._controls.left[i] !== button) {
                this._controls.left.push(button);
            }
        }

        var footerLeft = this.$el.find(this.footerLeftSelector);
        var buttonContainerEl = $('<div></div>');
        footerLeft.append(buttonContainerEl);

        button.setElement(buttonContainerEl);
        button.render();
    };

    LivefyreContentView.prototype.removeButton = function (button) {
        button.destroy();
    };
    
    return LivefyreContentView;
});
