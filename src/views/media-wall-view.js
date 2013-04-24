/** 
 * A module to render tiled walls of Content
 * @module streamhub-sdk/views/media-wall-view
 */
define([
    'jquery',
    'streamhub-sdk/view',
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/util'
], function($, View, ContentView, Util) {
    
    /**
     * A view that displays Content in a media wall.
     * @alias module:streamhub-sdk/views/media-wall-view
     * @param opts {Object} A set of options to config the view with
     * @param opts.el {HTMLElement} The element in which to render the streamed content
     * @constructor
     */
    var MediaWallView = function(opts) {
        View.call(this, opts);
        var self = this;
        
        this.el = opts.el || document.createElement('div');
        $(this.el).addClass('streamhub-media-wall-view');
        this.sortOrder = opts.sortOrder || (function(obj) {
            return obj.createdAt * 1000 || 0;
        });
        
        // these are data structures for efficiently storing, adding
        // and searching displayed content
        this.contentViews = {};
        this.contentViewKeys = [];
        
        self.on('add', function(content, stream) {
            self.add(content, stream);
        });
        $(window).resize(function() {
            self.relayout();
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
        
        var sortKey = this.sortOrder(content);
        // todo: make this work more reliably... (currently assumes sortKey is a big number)
        while (this.contentViews.hasOwnProperty(sortKey)) {
            sortKey = sortKey + 1;
        }

        var contentView = this.createContentView(content);
        contentView.render();

        $(contentView.el).on('imageLoaded', function() {
            self.relayout();
        });

        // finding where the insertion should be - a naive solution is to search left to right
        // which is fine for us, because we're typically prepending 
        var sortKeyIndex = 0;
        for (var i in this.contentViewKeys) {
            if (sortKey < this.contentViewKeys[i] && sortKey > this.contentViewKeys[i+1]) {
                sortKeyIndex = i;
                break;
            }
        }

        this.contentViews[sortKey] = contentView;
        this.contentViewKeys.splice(sortKeyIndex, 0, sortKey);

        $(this.el).prepend(contentView.el);
        this.relayout();
    };
    
    MediaWallView.prototype.relayout = function() {
        var columnWidth = 0;
        var columnHeights = [];
        var cols = 0;
        var containerWidth = Util.innerWidth($(this.el));
        
        for (var i in this.contentViewKeys) {
            var contentView = this.contentViews[this.contentViewKeys[i]];
            var $contentView = $(contentView.el);
            
            if (columnWidth === 0) {
                columnWidth = Util.outerWidth($contentView);
                if (columnWidth !== 0) {
                    cols = Math.floor(containerWidth / columnWidth);
                    for (var j = 0; j < cols; j++) {
                        columnHeights[j] = 0;
                    }
                }
            }
            // get the minimum Y value from the columns
            var minimumY = Math.min.apply( Math, columnHeights );
            var maximumY = Math.max.apply( Math, columnHeights );
            var shortCol = 0;

            // Find index of short column, the first from the left
            for (var k = 0; k < columnHeights.length; k++) {
                if ( columnHeights[k] === minimumY ) {
                    shortCol = k;
                    break;
                }
            }
            // position the content
            var x = columnWidth * shortCol;
            var y = minimumY;
            
            $contentView.css('position', 'absolute');
            $contentView.css('left', x + 'px');
            $contentView.css('top', y + 'px');
            
            // apply height to column
            columnHeights[shortCol] = minimumY + Util.outerHeight($contentView);
            if (columnHeights[shortCol] > maximumY) {
                maximumY = columnHeights[shortCol];
            }
            
            $(this.el).css('height', maximumY + 'px');
        }
    };

    return MediaWallView;
});
