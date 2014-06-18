var $ = require('streamhub-sdk/jquery');
var inherits = require('inherits');
var debug = require('streamhub-sdk/debug');
var CardContentView = require('streamhub-sdk/content/views/card-content-view');
var asLivefyreContentView = require('streamhub-sdk/content/views/mixins/livefyre-content-view-mixin');

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
var LivefyreContentView = function (opts) {
    opts = opts || {};
    this.template = opts.template;

    CardContentView.apply(this, arguments);
    asLivefyreContentView(this, opts);
};
inherits(LivefyreContentView, CardContentView);

/**
 * Render the content inside of the LivefyreContentView's element.
 * @returns {LivefyreContentView}
 */
LivefyreContentView.prototype.render = function () {
    CardContentView.prototype.render.call(this);
    return this;
};

module.exports = LivefyreContentView;
