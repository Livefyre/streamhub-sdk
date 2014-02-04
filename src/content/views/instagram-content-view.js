define([
    'streamhub-sdk/content/views/content-view',
    'inherits'],
function (ContentView, inherits) {
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

    InstagramContentView.prototype.events = ContentView.prototype.events.extended({
        'imageError.hub': function (e, oembed) {
            this.remove();
        }
    });

    /**
     * Gets the template rendering context. By default, returns "this.content".
     * @return {Content} The content object this view was instantiated with.
     */
    InstagramContentView.prototype.getTemplateContext = function () {
        var context = ContentView.prototype.getTemplateContext.call(this);

        context.authorDisplayName = context.author.displayName;

        context.contentSourceName = 'instagram';

        return context;
    };

    return InstagramContentView;
});
