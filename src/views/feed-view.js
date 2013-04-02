define(['jquery', 'streamhub-sdk/view', 'streamhub-sdk/content/views/content-view'],
function($, View, ContentView) {
    
    /**
     * A simple view that displays content items as a feed.
     * @param opts {Object} A set of options to config the view with
     * @param opts.streams {Object.<string, Stream>} A dictionary of streams to listen to
     * @param opts.el {HTMLElement} The element in which to render the streamed content
     * @constructor
     */
    var FeedView = function(opts) {
        View.call(this, opts);
        
        var self = this;
        self.on('add', function(content, stream) {
            self._add(content, stream);
        });
    };
    $.extend(FeedView.prototype, View.prototype);

    FeedView.prototype._add = function(content, stream) {
        var contentEl = document.createElement('div'),
            contentView = new ContentView({
                el: contentEl,
                content: content
            });
        console.log(content);
        contentView.render();
        $(this.el).prepend(contentEl);
    };

    return FeedView;
});