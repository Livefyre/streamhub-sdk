define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/view',
    'streamhub-ui/util/user-agent',
    'hgn!streamhub-sdk/content/templates/oembed-photo',
    'hgn!streamhub-sdk/content/templates/oembed-video',
    'hgn!streamhub-sdk/content/templates/oembed-video-promise',
    'hgn!streamhub-sdk/content/templates/oembed-link',
    'hgn!streamhub-sdk/content/templates/oembed-rich',
    'inherits'
],
function($, View, util, OembedPhotoTemplate, OembedVideoTemplate, OembedVideoPromiseTemplate, OembedLinkTemplate, OembedRichTemplate, inherits) {
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
        this.oembed = opts.oembed || {};
        View.call(this, opts);

        if (!this.oembed) {
            return;
        }

        this._isMobile = util.isMobile();
        this.template = this.OEMBED_TEMPLATES[this.oembed.type];
    };
    inherits(OembedView, View);

    OembedView.prototype.elClass = 'oembed';

    /**
     * A mapping of oembed type to its mustache template for rendering
     * @readonly
     * @enum {Template}
     */
    OembedView.prototype.OEMBED_TEMPLATES = {
        'photo': OembedPhotoTemplate,
        'video': OembedVideoTemplate,
        'video_promise': OembedVideoPromiseTemplate,
        'link':  OembedLinkTemplate,
        'rich':  OembedRichTemplate
    };

    /**
     * Get the aspect ratio for the embed.
     * @param {function} done Callback invoked with one parameter (width/height)
     */
    OembedView.prototype.getAspectRatio = function (done) {
        function loadImg(url, cb) {
            var img = new Image();
            img.onload = function () {
                cb(img.naturalWidth/img.naturalHeight);
            };

            img.onerror = function () {
                cb(1);
            };
            img.src = url;
        }

        var provider = (this.oembed.provider_name || '').toLowerCase();
        var width = this.oembed.width || this.oembed.thumbnail_width || 0;
        var height = this.oembed.height || this.oembed.thumbnail_height || 0;

        if (provider === 'youtube') {
            return done(16/9);
        }

        if (provider === 'facebook' && this._isMobile) {
            return done(16/9);
        }

        if (width > 0 && height > 0) {
            return done(width/height);
        }

        if (this.oembed.type === 'photo') {
            return loadImg(this.oembed.url, done)
        }

        if (this.oembed.thumbnail_url) {
            return loadImg(this.oembed.thumbnail_url, done);
        }

        done(1);
    };

    /**
     * Renders the template and appends itself to this.el
     * For oembed types with thumbnails attach image load/error handlers
     */
    OembedView.prototype.render = function() {
        // YouTube oembed thumbnails (hqdefault.jpg) include a letterbox for 16:9 aspect ratio
        // videos. Use mqdefault.jpg instead as it does not have letterboxing.
        // http://kb.oboxsites.com/knowledgebase/how-to-remove-black-bars-on-youtube-oembed-thumbnails/
        if (this.oembed.provider_name && this.oembed.provider_name === 'YouTube') {
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

    return OembedView;
});
