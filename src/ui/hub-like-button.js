'use strict';

var auth = require('auth');
var HubToggleButton = require('streamhub-sdk/ui/hub-toggle-button');
var AuthRequiredCommand = require('streamhub-sdk/ui/auth-required-command');
var inherits = require('inherits');

function HubLikeButton (fnOrCommand, opts) {
    opts = opts || {};

    this._content = opts.content;
    if (this._content) {
        this._content.on("opine", function () { this._updateLikeCount() }.bind(this));
        this._content.on("removeOpine", function () { this._updateLikeCount() }.bind(this));
    }

    this._likeCommand = new AuthRequiredCommand(fnOrCommand);
    var enabled = auth.get('livefyre') ? this._content.isLiked(auth.get('livefyre').get('id')) : false;
    var likeCount = this._content.getLikeCount();
    HubToggleButton.call(this, this._likeCommand, {
        className: 'content-like',
        enabled: enabled,
        label: likeCount.toString(),
        errback: function (err) {
            if (err) {
                this._enabled = !this._enabled;
                this._handleClick();
            }
        }.bind(this)
    });

    var self = this;
    auth.on('authenticate.livefyre', function (credentials) {
        if (self._content.author.id === auth.get('livefyre').get('id')) {
            self._likeCommand.disable();
        }
        self._enabled = auth.get('livefyre') ? self._content.isLiked(auth.get('livefyre').get('id')) : false;
        self.render();
    });
    auth.on('logout', function () {
        self._likeCommand.enable();
        self._enabled = false;
        self.render();
    });
}
inherits(HubLikeButton, HubToggleButton);

HubLikeButton.prototype._execute = function () {
    this._command.execute(this._errback);
    if (! auth.isAuthenticated()) {
        return;
    }
    this._enabled = !this._enabled;
    this.$el.removeClass('hub-btn-toggle-on').removeClass('hub-btn-toggle-off');
    this._enabled ? this.$el.addClass('hub-btn-toggle-on') : this.$el.addClass('hub-btn-toggle-off');
    this._handleClick();
};

HubLikeButton.prototype._handleClick = function () {
    if (this._enabled) {
        //increment
        this.updateLabel(this._content.getLikeCount() + 1);
    } else {
        //decrement
        this.updateLabel(Math.max(0, this._content.getLikeCount() - 1));
    }
}

HubLikeButton.prototype._updateLikeCount = function () {
    if (this._content.getLikeCount() === parseInt(this._label,10)) {
        return;
    }

    this.updateLabel(this._content.getLikeCount());

    this.$el.removeClass('hub-btn-toggle-on').removeClass('hub-btn-toggle-off');
    this._enabled = auth.get('livefyre') ? this._content.isLiked(auth.get('livefyre').get('id')) : false;
    this._enabled ? this.$el.addClass('hub-btn-toggle-on') : this.$el.addClass('hub-btn-toggle-off');
}

module.exports = HubLikeButton;
