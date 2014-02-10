define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/auth',
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/ui/button/hub-button',
    'streamhub-sdk/ui/button/hub-toggle-button',
    'streamhub-sdk/collection/clients/write-client',
    'hgn!streamhub-sdk/content/templates/content',
    'streamhub-sdk/util',
    'inherits',
    'streamhub-sdk/debug'
], function ($, Auth, ContentView, LivefyreContent, HubButton, HubToggleButton, LivefyreWriteClient, ContentTemplate, util, inherits, debug) {
    'use strict';

    var log = debug('streamhub-sdk/content/views/livefyre-content-view');
    var LF_TOKEN = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJkb21haW4iOiAibGFicy10NDAyLmZ5cmUuY28iLCAiZXhwaXJlcyI6IDExMzkxNzI4ODEzLjAzOTY2LCAidXNlcl9pZCI6ICJkZW1vLTAifQ.ZJLrUcRf3MbgOqJ1tLO81pZ7ANfatsKgLie6T6S_Wi4';
    var USER_ID = 'demo-0@labs-t402.fyre.co';

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
        this._likeRequestListener = false;
        this._rendered = false;

        ContentView.call(this, opts);
    };
    inherits(LivefyreContentView, ContentView);


    /**
     * Render the content inside of the LivefyreContentView's element.
     * @returns {LivefyreContentView}
     */
    LivefyreContentView.prototype.render = function () {
        ContentView.prototype.render.call(this);
        this._setupButtons();

        return this;
    };

    LivefyreContentView.prototype._handleLikeClick = function () {
        // Lazily attach event handler for contentLike
        if (! this._likeRequestListener) {
            var self = this;
            $('body').on('contentLike.hub', function (e, content) {
                Auth.setToken(LF_TOKEN);

                var writeClient = new LivefyreWriteClient();

                var likeIntent;
                if (! content.isLiked(USER_ID)) {
                    likeIntent = writeClient.like;
                } else {
                    likeIntent = writeClient.unlike;
                }
                likeIntent.call(writeClient, {
                    network: content.collection.network,
                    siteId: content.collection.siteId,
                    collectionId: content.collection.id,
                    lftoken: LF_TOKEN,
                    contentId: content.id
                });
            });
            this._likeRequestListener = true;
        }

        this.$el.trigger('contentLike.hub', this.content);
    };

    LivefyreContentView.prototype._handleShare = function () {
        console.log('contentShare.hub');
        this.$el.trigger('contentShare.hub', this.content);
    };

    LivefyreContentView.prototype._setupButtons = function () {
        if (! (this.content instanceof LivefyreContent)) {
            return;
        }
        if (! this._rendered) {
            var likeCount = this.content.getLikeCount();
            var likeButton = new HubToggleButton(this._handleLikeClick.bind(this), {
                className: 'hub-content-like',
                on: this.content.isLiked(USER_ID), //TODO(ryanc): Get user id from auth
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
        } else {
            for (var i=0; i < this._controls['left'].length; i++) {
                this.addButton(this._controls['left'][i]);
            }
        }

        this._rendered = true;
    };

    LivefyreContentView.prototype.addButton = function (button) {
        this._controls['left'].push(button);

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
