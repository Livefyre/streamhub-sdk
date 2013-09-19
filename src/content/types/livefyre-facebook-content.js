define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/content/types/livefyre-content',
    'inherits'
], function($, LivefyreContent, inherits) {
    'use strict';

    /**
     * Represents a piece of Livefyre's content curated from Facebook.
     * @param json {Object} An object obtained via a Livefyre stream that represents the
     *        state of the content.
     * @exports streamhub-sdk/content/types/livefyre-facebook-content
     * @constructor
     */
    var LivefyreFacebookContent = function (json) {
        LivefyreContent.call(this, json);

        // There may be times when Facebook content is just a string with no HTML.
        // Sizzle may throw an error, so wrap any parsing to avoid these errors.
        try {
            var bodyEl = $(this.body);
            bodyEl.find('.fyre-image, .fyre-link').remove();
            this.body = outerHtml(bodyEl);
        } catch(e) {
            // Pass
        }
    };
    inherits(LivefyreFacebookContent, LivefyreContent);

    /**
     * Get a jQuery Element as HTML
     */
    function outerHtml ($el) {
        var $tmp = $('<div></div>');
        $tmp.append($el);
        return $tmp.html();
    }

    return LivefyreFacebookContent;
});
