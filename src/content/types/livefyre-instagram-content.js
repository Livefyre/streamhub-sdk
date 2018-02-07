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
        };
        inherits(LivefyreInstagramContent, LivefyreContent);

        LivefyreInstagramContent.prototype.typeUrn = 'urn:livefyre:js:streamhub-sdk:content:types:livefyre-instagram';

        LivefyreInstagramContent.prototype._setBody = function () {
            if (this.attachments.length) {
                if (this.attachments[0].title) {
                    this.body = this.attachments[0].title
                }

                for (var i = 0; i < this.attachments.length; i++) {
                    var attachment = this.attachments[i];
                    if (attachment.type === 'video') {
                        attachment.thumbnail_url = attachment.link + 'media';
                        attachment.html = '<iframe class="instagram-video" src="' + attachment.link + 'embed"' +
                            ' style="width:100%; height:100%; max-width:' + attachment.width +
                            'px; max-height:' + attachment.height + 'px;"></iframe>';
                    }
                }
            }
        };

        return LivefyreInstagramContent;
    });
