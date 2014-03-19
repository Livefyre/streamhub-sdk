define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/auth',
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-opine',
    'streamhub-sdk/ui/hub-button',
    'streamhub-sdk/ui/hub-toggle-button',
    'streamhub-sdk/collection/liker',
    'hgn!streamhub-sdk/content/templates/content',
    'streamhub-sdk/util',
    'inherits',
    'streamhub-sdk/debug'
], function ($, Auth, ContentView, LivefyreContent, LivefyreOpine, HubButton, HubToggleButton, Liker, ContentTemplate, util, inherits, debug) {
    'use strict';

    var LIKE_REQUEST_LISTENER = false;

    var DEFAULT_LABELS = {
        like: 'Like',
        liked: 'Liked'
    };

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
        this._labels = $.extend({}, DEFAULT_LABELS, opts.labels || {});

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
    LivefyreContentView.prototype.footerRightSelector = '.content-footer-right';

    LivefyreContentView.prototype.events = ContentView.prototype.events.extended({
        'contentLiked.hub': function (e) {
            this._likeButton.updateLabel(this._labels.liked);
        },
        'contentUnliked.hub': function (e) {
            this._likeButton.updateLabel(this._labels.like);
        }
    });

    LivefyreContentView.handleLikeClick = function (e, content) {
        var liker = new Liker();
        var userUri = Auth.getUserUri();

        if (! content.isLiked(userUri)) {
            liker.like(content, function (err, response) {
                if (err) {
                    throw err;
                }
                $(e.target).trigger('contentLiked.hub', response);
            });
        } else {
            liker.unlike(content, function (err, response) {
                if (err) {
                    throw err;
                }
                $(e.target).trigger('contentUnliked.hub', response);
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
        this.$el.find(this.footerRightSelector).empty();

        if (! (this.content instanceof LivefyreContent)) {
            return;
        }

        this._likeButton = this._createLikeButton();
        this.addButton(this._likeButton);

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

    /**
     * Create a Button to be used for Liking functionality
     * @protected
     */
    LivefyreContentView.prototype._createLikeButton = function () {
        var likeCount = this.content.getLikeCount();
        var likeButton = new HubToggleButton(this._handleLikeClick.bind(this), {
            className: 'content-like',
            enabled: this.content.isLiked(Auth.getUserUri()), //TODO(ryanc): Get user id from auth
            label: likeCount.toString()
        });
        return likeButton;
    };

    LivefyreContentView.prototype.addButton = function (button, opts) {
        opts = opts || {};
        opts.side = opts.side === 'right' ? 'right' : 'left';

        var controlSet = this._controls[opts.side];

        for (var i=0; i < controlSet.length; i++) {
            if (controlSet[i] !== button) {
                controlSet.push(button);
            }
        }

        var footerSelector = opts.side === 'left' ? this.footerLeftSelector : this.footerRightSelector;
        var footerSideEl = this.$el.find(footerSelector);
        var buttonContainerEl = $('<div></div>');
        footerSideEl.append(buttonContainerEl);

        button.setElement(buttonContainerEl);
        button.render();
    };

    LivefyreContentView.prototype.removeButton = function (button) {
        button.destroy();
    };
    
    return LivefyreContentView;
});
