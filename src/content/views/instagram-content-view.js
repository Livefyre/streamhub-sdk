define([
    'streamhub-sdk/content/views/content-view',
    'hgn!streamhub-sdk/content/templates/instagram',
    'streamhub-sdk/util'],
function (ContentView, InstagramContentTemplate, util) {
    
    /**
     * A view for rendering instagram content into an element.
     * @param opts {Object} The set of options to configure this view with (See ContentView).
     * @exports streamhub-sdk/content/views/instagram-content-view
     * @constructor
     */

    var InstagramContentView = function (opts) {
        ContentView.call(this, opts);
    };
    util.inherits(InstagramContentView, ContentView);
    
    InstagramContentView.prototype.elClass += ' content-instagram ';
    InstagramContentView.prototype.template = InstagramContentTemplate;

    InstagramContentView.prototype.attachHandlers = function () {
        ContentView.prototype.attachHandlers.call(this);

        var self = this;
        this.$el.on('imageError.hub', function(e, oembed) {
            self.remove();
        });
    };

    return InstagramContentView;
});
