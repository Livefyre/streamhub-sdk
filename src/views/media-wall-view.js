define([
    'jquery',
    'jquery-isotope',
    'streamhub-sdk/view',
    'streamhub-sdk/content/views/content-view',
    'jquery-imagesloaded'
], function($, Isotope, View, ContentView) {
    
    /**
     * A view that displays Content in a media wall.
     * @param opts {Object} A set of options to config the view with
     * @param opts.streams {Object.<string, Stream>} A dictionary of streams to listen to
     * @param opts.el {HTMLElement} The element in which to render the streamed content
     * @constructor
     */
    var MediaWallView = function(opts) {
        View.call(this, opts);
        
        this.el = opts.el || document.createElement('div');
        this.contentViews = [];

        $(this.el).isotope({
            itemSelector: '.content',
            isAnimated: true,
            animationEngine: 'jquery'
        });

        var self = this;
        self.on('add', function(content, stream) {
            self.add(content, stream);
        });
    };
    $.extend(MediaWallView.prototype, View.prototype);

    /**
     * Add a piece of Content to the MediaWallView
     * @param content {Content} A Content model to add to the MediaWallView
     * @return the newly created ContentView
     */
    MediaWallView.prototype.add = function(content, stream) {
        var self = this;
        
        var contentView = new ContentView({content:content});
        contentView.render();
        var $contentView = $(contentView.el);

        $(this.el).prepend($contentView)
            .isotope('appended', $contentView)
            .isotope('reLayout');
        
        $contentView.imagesLoaded(function() {
            $(self.el).isotope('reLayout').isotope('reloadItems');
        });
        
    };

    return MediaWallView;
});