/**
 * Providers that support created at urls, as long as they match the regex.
 * @const {Object}
 */
var SUPPORTED_PERMALINK_PROVIDERS = {
    facebook: /^https?:\/\/(www\.)?facebook\.com/,
    instagram: /^https?:\/\/(www\.)?instagram\.com/
};

function getContentPermalink(provider, content) {
    if (provider === 'twitter') {
        return 'https://twitter.com/statuses/' + content.tweetId;
    }

    var attachments = content && content.attachments || [];
    if (!attachments.length) {
        return;
    }

    var attachment = attachments[0];
    var attachmentProvider = (attachment.provider_name || '').toLowerCase();
    var regex = SUPPORTED_PERMALINK_PROVIDERS[attachmentProvider];
    if (regex && regex.test(attachment.link)) {
        return attachment.link;
    }
}

module.exports = {
    getContentPermalink: getContentPermalink
};
