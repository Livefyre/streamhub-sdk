var $ = require('streamhub-sdk/jquery');
var View = require('streamhub-sdk/view');
var OembedPhotoTemplate = require('hgn!streamhub-sdk/content/templates/oembed-photo');
var OembedVideoTemplate = require('hgn!streamhub-sdk/content/templates/oembed-video');
var OembedLinkTemplate = require('hgn!streamhub-sdk/content/templates/oembed-link');
var OembedRichTemplate = require('hgn!streamhub-sdk/content/templates/oembed-rich');
var inherits = require('inherits');

'use strict';

/**
 * A view that renders oembed attachments
 *
 * @param opts {Object} A set of options to config the view with
 * @param opts.el {HTMLElement} The element in which to render the streamed content
 * @param opts.oembed {Object} The oembed attachment object to display
 * @fires OembedView#imageLoaded.hub
 * @fires OembedView#imageError.hub
 * @exports streamhub-sdk/content/views/oembed-view
 * @constructor
 */
var OembedView = function(opts) {
    View.call(this);
    this.oembed = opts.oembed || {};
    if (!this.oembed) {
        return;
    }
    this.template = this.OEMBED_TEMPLATES[this.oembed.type];
};
inherits(OembedView, View);

/**
 * A mapping of oembed type to its mustache template for rendering 
 * @readonly
 * @enum {Template}
 */
OembedView.prototype.OEMBED_TEMPLATES = {
    'photo': OembedPhotoTemplate,
    'video': OembedVideoTemplate,
    'link':  OembedLinkTemplate,
    'rich':  OembedRichTemplate
};

/**
 * Renders the template and appends itself to this.el
 * For oembed types with thumbnails attach image load/error handlers
 */
OembedView.prototype.render = function() {
    // YouTube oembed thumbnails (hqdefault.jpg) include a letterbox for 16:9 aspect ratio
    // videos. Use mqdefault.jpg instead as it does not have letterboxing.
    // http://kb.oboxsites.com/knowledgebase/how-to-remove-black-bars-on-youtube-oembed-thumbnails/
    if (this.oembed.provider_name === 'YouTube') {
        var re = /(hqdefault.jpg)$/;
        if (re.test(this.oembed.thumbnail_url)) {
            this.oembed.thumbnail_url = this.oembed.thumbnail_url.replace(re, 'mqdefault.jpg');
        }
    }
    var context = $.extend({}, this.oembed);
    this.$el.html(this.template(context));

    if (this.oembed.type !== 'photo' && this.oembed.type !== 'video') {
        return;
    }

    // handle oembed loading gracefully
    var self = this;
    var newImg = this.$el.find('img.content-attachment-actual-image');
    newImg.hide();
    newImg.on('load', function() {
        if (newImg.parent().is('.content-attachment-photo')) {
            newImg.parent().fadeIn();
        } else {
            newImg.fadeIn();
        }
        /**
         * Image load success
         * @event OembedView#imageLoaded.hub
         */
        self.$el.trigger('imageLoaded.hub');
    });
    newImg.on('error', function() {
        /**
         * Image load error
         * @event OembedView#imageError.hub
         */
        self.$el.trigger('imageError.hub', self.oembed);
    });
};

module.exports = OembedView;
