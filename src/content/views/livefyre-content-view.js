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

        this._addInitialButtons();
    };
    inherits(LivefyreContentView, ContentView);

    LivefyreContentView.prototype.footerLeftSelector = '.content-footer-left > .content-control-list';
    LivefyreContentView.prototype.footerRightSelector = '.content-footer-right > .content-control-list';


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

    /**
     * Create and add any buttons that should be on all LivefyreContentViews.
     * This will be invoked on construction
     * They will be rendered by ._renderButtons later.
     */
    LivefyreContentView.prototype._addInitialButtons = function () {
        // Like
        this._likeButton = this._createLikeButton();
        if (this._likeButton) {
            this.addButton(this._likeButton);
        }
        // Share
        this._shareButton = this._createShareButton();
        if (this._shareButton) {
            this.addButton(this._shareButton);
        }
    };

    /**
     * Clear out the current control list,
     * and render all the buttons that have been added
     */
    LivefyreContentView.prototype._renderButtons = function () {
        var $leftControls = this.$el.find(this.footerLeftSelector);
        var $rightControls = this.$el.find(this.footerRightSelector);

        $leftControls.empty();
        this._controls.left.forEach(function (button) {
            $leftControls.append(button.$el);
        });

        $rightControls.empty();
        this._controls.right.forEach(function (button) {
            $rightControls.append(button.$el);
        });
    };

    LivefyreContentView.prototype._updateLikeCount = function () {
        this._likeButton.updateLabel(this.content.getLikeCount().toString());
    };

    /**
     * Create a Button to be used for Liking functionality
     * @protected
     */
    LivefyreContentView.prototype._createLikeButton = function () {
        // Don't render a button when no auth delegate
        if ( ! auth.hasDelegate('login')) {
            return;
        }
        // Don't render a button if this isn't actually LivefyreContent
        if ( ! (this.content instanceof LivefyreContent)) {
            return;
        }
        return new HubLikeButton(this._commands.like, {
            content: this.content
        });
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

    /**
     * Add a button to this ContentView.
     * This will re-render the buttons
     * @param button {Button} Button to add
     * @param [opts] {object}
     * @param [opts.side='left'] {'right'|'left'} Which side of the footer to add
     *     the button to
     */
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

        // Don't add the same button twice
        if (footerControls.indexOf(button) !== -1) {
            return;
        }

        footerControls.push(button);
        var buttonContainerEl = $('<div></div>');
        button.setElement(buttonContainerEl);
        button.render();

        // If the footer is rendered, then re-render all buttons.
        // If buttons are added before the ContentView is, then we shouldn't
        // render buttons
        if (footerSide.length) {
            this._renderButtons();
        }
    };

    /**
     * Remove a Button from the ContentView
     * @param button {Button} Button to remove
     */
    LivefyreContentView.prototype.removeButton = function (button) {
        this._controls.left.splice(this._controls.left.indexOf(button), 1);
        this._controls.right.splice(this._controls.right.indexOf(button), 1);

        button.destroy();
    };
    
    return LivefyreContentView;
});
