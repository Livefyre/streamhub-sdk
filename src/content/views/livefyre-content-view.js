define([
    'streamhub-sdk/jquery',
    'auth',
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-opine',
    'streamhub-sdk/ui/auth-required-command',
    'streamhub-sdk/ui/command',
    'streamhub-sdk/ui/hub-button',
    'streamhub-sdk/ui/hub-like-button',
    'streamhub-sdk/collection/liker',
    'hgn!streamhub-sdk/content/templates/content',
    'streamhub-sdk/util',
    'inherits',
    'streamhub-sdk/debug'
], function ($, auth, ContentView, LivefyreContent, LivefyreOpine, AuthRequiredCommand, Command, HubButton, HubLikeButton, Liker, ContentTemplate, util, inherits, debug) {
    'use strict';

    /**
     * Defines the base class for all content-views. Handles updates to attachments
     * and loading of images.
     *
     * @param opts {Object} The set of options to configure this view with.
     * @param opts.content {Content} The content object to use when rendering. 
     * @param opts.el {?HTMLElement} The element to render this object in.
     * @param opts.shareCommand {streamhub-sdk/ui/command} Command to use
     *     for share button. If not present or cannot execute, no share button
     * @fires LivefyreContentView#removeContentView.hub
     * @exports streamhub-sdk/content/views/content-view
     * @constructor
     */
    var LivefyreContentView = function LivefyreContentView (opts) {
        opts = opts || {};

        this._rendered = false;
        this._controls = {
            'left': [],
            'right': []
        };
        this._commands = {};
        this._setCommand({
            like: opts.likeCommand,
            share: opts.shareCommand
        });

        ContentView.call(this, opts);
    };
    inherits(LivefyreContentView, ContentView);

    LivefyreContentView.prototype.footerLeftSelector = '.content-footer-left';
    LivefyreContentView.prototype.footerRightSelector = '.content-footer-right';


    /**
     * Set the a command for a buton
     * This should only be called once.
     * @private
     */
    LivefyreContentView.prototype._setCommand = function (cmds) {
        for (var name in cmds) {
            if (cmds.hasOwnProperty(name)) {
                if (! cmds[name]) {
                    continue;
                }
                this._commands[name] = cmds[name];

                // If canExecute changes, re-render buttons because now maybe the button should appear
                cmds[name].on('change:canExecute', this._renderButtons.bind(this));
            }
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

    LivefyreContentView.prototype._renderButtons = function () {
        if (! (this.content instanceof LivefyreContent)) {
            return;
        }

        this.$el.find(this.footerLeftSelector).empty();
        this.$el.find(this.footerRightSelector).empty();

        //TODO(ryanc): Wait until we have replies on SDK
        //var replyCommand = new Command(function () {
        //    self.$el.trigger('contentReply.hub');
        //});
        //var replyButton = new HubButton(replyCommand, {
        //    className: 'btn-link content-reply',
        //    label: 'Reply'
        //});
        //this.addButton(replyButton);

        this._renderLikeButton();
        this._renderShareButton();
    };

    LivefyreContentView.prototype._updateLikeCount = function () {
        this._likeButton.updateLabel(this.content.getLikeCount().toString());
    };

    /**
     * Create a Button to be used for Liking functionality
     * @protected
     */
    LivefyreContentView.prototype._createLikeButton = function () {
        if (! auth.hasDelegate('login')) {
            return; // Don't render a button when not logged in
        }
        return new HubLikeButton(this._commands.like, {
            content: this.content
        });
    };

    LivefyreContentView.prototype._renderLikeButton = function () {
        var likeButton = this._likeButton = this._createLikeButton();
        if ( ! likeButton) {
            return;
        }
        this.addButton(likeButton);
    };

    /**
     * Render a Share Button
     * @protected
     */
    LivefyreContentView.prototype._renderShareButton = function () {
        var shareButton = this._createShareButton();
        if ( ! shareButton) {
            return;
        }
        this.addButton(shareButton);
    };

    /**
     * Create a Share Button
     * @protected
     */
    LivefyreContentView.prototype._createShareButton = function () {
        var shareCommand = this._commands.share;
        if ( ! (shareCommand && shareCommand.canExecute())) {
            return;
        }
        var shareButton = new HubButton(shareCommand, {
            className: 'btn-link content-share',
            label: 'Share'
        });
        return shareButton;
    };

    LivefyreContentView.prototype.addButton = function (button, opts) {
        opts = opts || {};
        var footerControls;
        var footerSide;
        if (opts.side === 'right') {
            footerControls = this._controls.right;
            footerSide = this.$el.find(this.footerRightSelector);
        } else {
            footerControls = this._controls.left;
            footerSide = this.$el.find(this.footerLeftSelector);
        }

        if (footerControls.length === 0) {
            footerControls.push(button);
        }
        for (var i=0; i < footerControls.length; i++) {
            if (footerControls[i] !== button) {
                footerControls.push(button);
            }
        }

        var buttonContainerEl = $('<div></div>');
        footerSide.append(buttonContainerEl);

        button.setElement(buttonContainerEl);
        button.render();
    };

    LivefyreContentView.prototype.removeButton = function (button) {
        this._controls.left.splice(this._controls.left.indexOf(button), 1);
        this._controls.right.splice(this._controls.right.indexOf(button), 1);

        button.destroy();
    };
    
    return LivefyreContentView;
});
