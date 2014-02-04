define([
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/ui/button',
    'inherits'],
function (ContentView, Button, inherits) {
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

    InstagramContentView.prototype.render = function () {
        ContentView.prototype.render.call(this);

        if (! this._rendered) {
            var likeButton = new Button(undefined, {
                elClassPrefix: 'hub',
                className: 'hub-content-like'
            });
            var shareButton = new Button(undefined, {
                elClassPrefix: 'hub',
                className: 'hub-btn-link hub-content-share',
                label: 'Share'
            });

            this.addButton(likeButton);
            this.addButton(shareButton);
        } else {
            for (var i=0; i < this._controls['left'].length; i++) {
                this.addButton(this._controls['left'][i]);
            }
        }

        this._rendered = true;
    };

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
