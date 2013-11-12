var ContentView = require('streamhub-sdk/content/views/content-view');
var InstagramContentTemplate = require('hgn!streamhub-sdk/content/templates/instagram');
var inherits = require('inherits');

'use strict';

/**
 * A view for rendering instagram content into an element.
 * @param opts {Object} The set of options to configure this view with (See ContentView).
 * @exports streamhub-sdk/content/views/instagram-content-view
 * @constructor
 */

var InstagramContentView = function (opts) {
    ContentView.call(this, opts);
};
inherits(InstagramContentView, ContentView);

InstagramContentView.prototype.elClass += ' content-instagram ';
InstagramContentView.prototype.template = InstagramContentTemplate;

InstagramContentView.prototype.attachHandlers = function () {
    ContentView.prototype.attachHandlers.call(this);

    var self = this;
    this.$el.on('imageError.hub', function(e, oembed) {
        self.remove();
    });
};

module.exports = InstagramContentView;
