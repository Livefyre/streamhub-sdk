/**
 * Providers that support created at urls, as long as they match the regex.
 * @const {Object}
 */
var SUPPORTED_PERMALINK_PROVIDERS = {
    facebook: /^https?:\/\/(www\.)?facebook\.com/,
    instagram: /^https?:\/\/(www\.)?instagram\.com/
};

/**
 * Keypress wrapper that only calls the wrapped function when the enter key is
 * pressed. Otherwise, nothing happens.
 * @param {function} wrappedFn Function to call when enter is pressed.
 * @return {function} Function that handles the keypress events.
 */
function enterKeypressWrapper(wrappedFn) {
    return function (e) {
        if (e.which !== 13) {
            return;
        }
        e.stopPropagation();
        wrappedFn(e);
    };
}

/**
 * Generate permalink for content based on the provider.
 * @param {string} provider The provider of the content.
 * @param {Content} content The content to generate the permalink for.
 * @return {string=} Content permalink.
 */
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

function getTextContent(html, removeHashTags) {
    var div = document.createElement('div');
    var stripHashTagRegex = new RegExp('#([^\\s]*)', 'g');
    try {
        div.innerHTML = html;
        var val = (div.textContent || div.innerText || '');
        return removeHashTags ? val.replace(stripHashTagRegex) : val;
    } catch (e) {
        // Just incase someone gives us some bad html
    }
    return '';
}

/**
 * Truncate a string that may or may not contain html. Recursively traverses
 * through the DOM nodes and truncates the text node that is over the provided
 * length.
 * @param {string} htmlString The string to truncate.
 * @param {number} len The amount to truncate the string.
 * @return {string} The truncated string.
 */
function truncateHtml(htmlString, len) {
    var div = document.createElement('div');
    div.innerHTML = htmlString;

    /**
     * Truncate the text node element by the provided amount.
     * @param {Text} textNode The DOM TextNode to truncate.
     * @param {number} len The amount to truncate the textNode.
     */
    function truncate(textNode, len) {
        if (textNode.length <= len) {
            return;
        }
        textNode.nodeValue = textNode.substringData(0, len) + '…';
    }

    /**
     * Traverse through the children of the provided node. For each child, check
     * the innerText and determine if it needs to be truncated or not.
     * @param {Node} node The DOM node to traverse.
     * @param {number} remainingLen Remaining length to be truncated.
     */
    function traverse(node, remainingLen) {
        var childNode;
        var nodeLen;
        var lastIdx;

        for (var i = 0; i < node.childNodes.length; i++) {
            childNode = node.childNodes[i];
            nodeLen = (childNode.nodeType === 3 ? childNode : childNode.innerText).length;
            lastIdx = i;

            // If the length of the node is less than the remaining length of
            // the original truncated length, move to the next node and remove
            // the node length from remaining length.
            if (nodeLen <= remainingLen) {
                remainingLen -= nodeLen;
                continue;
            }

            // The current node is longer than the remaining truncation length.
            // If there are child nodes, traverse into the current node. If
            // there are no nodes, truncate the text.
            if (childNode.childNodes && childNode.childNodes.length) {
                traverse(childNode, remainingLen);
            } else if (childNode.nodeType === 3) {
                truncate(childNode, remainingLen);
            }
            break;
        }

        // Remove all child nodes after the last index that was processed above.
        var nodes = Array.prototype.slice.call(node.childNodes);
        for (var i = lastIdx + 1; i < nodes.length; i++) {
            node.removeChild(nodes[i]);
        }
    }

    traverse(div, len);
    return div.innerHTML;
}

module.exports = {
    enterKeypressWrapper: enterKeypressWrapper,
    getContentPermalink: getContentPermalink,
    getTextContent: getTextContent,
    truncateHtml: truncateHtml
};
