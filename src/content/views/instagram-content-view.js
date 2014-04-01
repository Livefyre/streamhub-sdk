define([
    'streamhub-sdk/content/views/livefyre-content-view',
    'inherits'],
function (LivefyreContentView, inherits) {
    'use strict';
    
    /**
     * A view for rendering instagram content into an element.
     * @param opts {Object} The set of options to configure this view with (See LivefyreContentView).
     * @exports streamhub-sdk/content/views/instagram-content-view
     * @constructor
     */

    var InstagramContentView = function (opts) {
        LivefyreContentView.call(this, opts);
    };
    inherits(InstagramContentView, LivefyreContentView);
    
    InstagramContentView.prototype.elClass += ' content-instagram ';

    InstagramContentView.prototype.events = LivefyreContentView.prototype.events.extended({
        'imageError.hub': function (e, oembed) {
            this.remove();
        }
    });

    /**
     * Gets the template rendering context. By default, returns "this.content".
     * @return {Content} The content object this view was instantiated with.
     */
    InstagramContentView.prototype.getTemplateContext = function () {
        var context = LivefyreContentView.prototype.getTemplateContext.call(this);

        context.authorDisplayName = context.author.displayName;

        context.contentSourceName = 'instagram';

        return context;
    };

    return InstagramContentView;
});
