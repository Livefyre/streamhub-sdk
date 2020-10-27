define([
    'streamhub-sdk/content/types/livefyre-content', 'inherits'],
    function (LivefyreContent, inherits) {
        'use strict';

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
            });
        }

        return LivefyreInstagramContent;
    });
