define([
    'streamhub-sdk/content/types/livefyre-content', 'inherits'],
    function (LivefyreContent, inherits) {
        'use strict';

        var MEDIA_THUMBNAIL_SUFFIX = 'media/?size=m';
        var MEDIA_URL_SUFFIX = 'media/?size=l';

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

                // Stale CDN urls use a different domain than media compatible urls
                var isThumbnailCdn = attachment.thumbnail_url.indexOf('www.instagram.com') === -1;
                var isUrlCdn = attachment.url.indexOf('www.instagram.com') === -1;

                var splitUrl = attachment.link.split('/');
                var linkContainsUsername = splitUrl.length === 7;
                var thumbnailContainsUsername = !isThumbnailCdn && attachment.thumbnail_url.split('/').length === 7;
                var urlContainsUsername = !isUrlCdn && attachment.url.split('/').length === 7;

                if (attachment.link && (isThumbnailCdn || isUrlCdn || linkContainsUsername || thumbnailContainsUsername || urlContainsUsername)) {
                    // Remove username if present in link
                    if (linkContainsUsername) {
                        splitUrl.splice(4, 1);
                    }
                    splitUrl = splitUrl.join('/');

                    attachment.thumbnail_url = splitUrl + MEDIA_THUMBNAIL_SUFFIX;
                    attachment.url = splitUrl + MEDIA_URL_SUFFIX;
                }
            });
        }


        return LivefyreInstagramContent;
    });
