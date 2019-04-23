define([
    'streamhub-sdk/content/types/livefyre-content', 'inherits'],
    function (LivefyreContent, inherits) {
        'use strict';

        var MEDIA_THUMBNAIL_SUFFIX = 'media/?size=m"';
        var MEDIA_URL_SUFFIX = 'media/?size=1';

        /**
         * An instagram Content constructed from a StreamHub state of of 'feed' type
         *     that was transformed by lfcore.v2.procurement.feed.transformer.instagram
         * @param json {Object} A state object from StreamHub APIs
         * @exports streamhub-sdk/content/types/livefyre-instagram-content
         * @constructor
         */
        var LivefyreInstagramContent = function (json) {
            LivefyreContent.call(this, json);
            this._setBody();
            this._mutateAttachments();
        };
        inherits(LivefyreInstagramContent, LivefyreContent);

        LivefyreInstagramContent.prototype.typeUrn = 'urn:livefyre:js:streamhub-sdk:content:types:livefyre-instagram';

        LivefyreInstagramContent.prototype._setBody = function () {
            if (this.attachments.length && this.attachments[0].title) {
                this.body = this.attachments[0].title
            }
        };

        LivefyreInstagramContent.prototype._mutateAttachments = function () {
            // Remove the instagram embed script to avoid load order issues
            var scriptRemovalRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
            this.attachments.forEach(function (attachment) {
                if (attachment.type === 'video') {
                    attachment.html = attachment.html.replace(scriptRemovalRegex, '');
                }

                if (attachment.link) {
                    var splitUrl = attachment.link.split('/');
                    // Remove username if present in link url
                    if(splitUrl.lenght === 7) {
                        splitUrl.splice(4,1);
                    }
                    splitUrl = splitUrl.join('/');
                    
                    attachment.thumbnail_url = splitUrl + MEDIA_THUMBNAIL_SUFFIX;
                    attachment.url = splitUrl + MEDIA_URL_SUFFIX;
                }
            });
        }


        return LivefyreInstagramContent;
    });
