var auth = require('auth');
var Command = require('streamhub-sdk/ui/command');
var HubButton  = require('streamhub-sdk/ui/hub-button');
var HubLikeButton = require('streamhub-sdk/ui/hub-like-button');
var LivefyreContent = require('streamhub-sdk/content/types/livefyre-content');
var hasFooterButtons = require('streamhub-sdk/content/views/mixins/footer-buttons-mixin');
// TODO: move share to a separate mixin
var ShareButton = require('streamhub-sdk/ui/share-button');

'use strict';

/**
 * A mixin that decorates an instance of ContentView 
 * to be a LivefyreContentView
 * LivefyreContentViews have streamhub-powered like, reply, and share buttons
 */
function asLivefyreContentView(contentView, opts) {
    opts = opts || {};
    hasFooterButtons(contentView);

    /**
     * Set the a command for a buton
     * This should only be called once.
     * @private
     */
    contentView._setCommand = function (cmds) {
        for (var name in cmds) {
            if (cmds.hasOwnProperty(name)) {
                if (! cmds[name]) {
                    continue;
                }
                contentView._commands[name] = cmds[name];

                // If canExecute changes, re-render buttons because now maybe the button should appear
                cmds[name].on('change:canExecute', contentView._footerView._renderButtons.bind(contentView));
            }
        }
    };

    contentView._addInitialButtons = function () {
        // Expand
        contentView._expandButton = contentView._createExpandButton();
        if (contentView._expandButton) {
            contentView.addButton(contentView._expandButton);
        }
        // Like
        contentView._likeButton = contentView._createLikeButton();
        if (contentView._likeButton) {
            contentView.addButton(contentView._likeButton);
        }
        // Reply
        contentView._replyButton = contentView._createReplyButton();
        if (contentView._replyButton) {
            contentView.addButton(contentView._replyButton);
        }
        // Share
        contentView._shareButton = contentView._createShareButton();
        if (contentView._shareButton) {
            contentView.addButton(contentView._shareButton);
        }
    };

    /**
     * Create a Button to be used for showing modal
     * @protected
     */
    contentView._createExpandButton = function () {
        return new HubButton(undefined, {
            className: 'content-action content-action-expand',
            buttonUrl: '#'
        });
    };

    /**
     * Create a Button to be used for Liking functionality
     * @protected
     */
    contentView._createLikeButton = function () {
        // Don't render a button when no auth delegate
        if ( ! auth.hasDelegate('login')) {
            return;
        }
        // Don't render a button if contentView isn't actually LivefyreContent
        if (! contentView.content.id) {
            return;
        }
        return new HubLikeButton(contentView._commands.like, {
            content: contentView.content
        });
    };

    /**
     * Create a Button to be used for replying
     */
    contentView._createReplyButton = function () {
        if ( ! contentView._replying) {
            return;
        }
        // Don't render reply button when no auth delegate
        if ( ! auth.hasDelegate('login')) {
            return;
        }
        var replyCommand = contentView._commands.reply;
        if ( ! (replyCommand && replyCommand.canExecute())) {
            return;
        }
        var replyButton = new HubButton(replyCommand, {
            className: 'btn-link content-reply',
            label: 'Reply'
        });
        return replyButton;
    };

    /**
     * Create a Share Button
     * @protected
     */
    contentView._createShareButton = function () {
        var shareCommand = contentView._commands.share;

        if (!shareCommand) {
            return new ShareButton({
                className: 'btn-link content-share',
                content: this.content
            });
        }
        if (! shareCommand.canExecute()) {
            return;
        }
        var shareButton = new HubButton(shareCommand, {
            className: 'btn-link content-share',
            label: 'Share'
        });
        return shareButton;
    };

    /**
     * Render the content inside of the LivefyreContentView's element.
     * @returns {LivefyreContentView}
     */
    var oldRender = contentView.render;
    contentView.render = function () {
        oldRender.apply(contentView, arguments);
        contentView.$el.addClass(contentView._themeClass);
    };

    contentView._updateLikeCount = function () {
        contentView._likeButton.updateLabel(contentView.content.getLikeCount().toString());
    };

    // init
    contentView._commands = {};
    contentView._setCommand({
        like: opts.likeCommand,
        reply: opts.replyCommand,
        share: opts.shareCommand
    });
    contentView._addInitialButtons();
};

module.exports = asLivefyreContentView;
