var LivefyreContent = require('streamhub-sdk/content/types/livefyre-content');
var LivefyreTwitterContent = require('streamhub-sdk/content/types/livefyre-twitter-content');
var LivefyreFacebookContent = require('streamhub-sdk/content/types/livefyre-facebook-content');
var Oembed = require('streamhub-sdk/content/types/oembed');
var LivefyreOembed = require('streamhub-sdk/content/types/livefyre-oembed');
var LivefyreInstagramContent = require('streamhub-sdk/content/types/livefyre-instagram-content');
var Storage = require('streamhub-sdk/storage');
var debug = require('streamhub-sdk/debug');
var Transform = require('stream/transform');
var inherits = require('inherits');

'use strict';


var log = debug('streamhub-sdk/content/state-to-content');


/**
 * An Object that transforms state objects from Livefyre APIs
 * into streamhub-sdk Content instances
 * @param authors {object} A mapping of authorIds to author information
 * @param [replies=false] {boolean} Whether to read out reply Content
 */
var StateToContent = function (opts) {
    opts = opts || {};
    this._authors = opts.authors || {};
    this._replies = opts.replies;
    Transform.call(this, opts);
};

inherits(StateToContent, Transform);


StateToContent.prototype._transform = function (state, done) {
    var contents;
    try {
        contents = StateToContent.transform(state, this._authors, {
            replies: this._replies
        });
    } catch (err) {
        this.emit('error transforming state-to-content', err);
        log('StateToContent.transform threw', err);
    }
    if (contents && contents.length) {
        this.push.apply(this, contents);
    }
    done();
};


/**
 * Creates the correct content type given the supplied "state".
 * @param state {Object} The livefyre content "state" as received by the
 *     client.
 * @return {LivefyreContent[]} An Array containing a Content that represents
 *     the passed state, if it was top-level. If opts.replies, then any
 *     reply Content that was transformed will be returned
 *     (including potentially many descendants)
 */
StateToContent.transform = function (state, authors, opts) {
    opts = opts || {};
    var isPublic = (typeof state.vis === 'undefined') || (state.vis === 1),
        isReply = state.content.parentId,
        type = StateToContent.enums.type[state.type],
        isAttachment = ('OEMBED' === type),
        isContent = ('CONTENT' === type),
        childStates = state.childContent || [],
        content,
        childContent = [],
        descendantContent = [];

    if ( ! (isAttachment || isContent)) {
        return;
    }

    content = StateToContent._createContent(state, authors);

    // Store content with IDs in case we later get
    // replies or attachments targeting it
    if (content && content.id) {
        var stored = Storage.get(content.id);
        if (stored) {
            // If existing content, update properties on existing instance
            if (isContent) {
                // This could be a delete state, so only update
                // properties that are actually set
                stored.set(StateToContent._getUpdatedProperties(content));
            }
            // Use the stored object, now that its properties have been
            // updated
            content = stored;
            // Don't handle attachment updating.
        } else {
            Storage.set(content.id, content);
        }
        childContent = Storage.get('children_'+content.id) || [];
    }

    // Get child states (replies and attachments)
    childStates = state.childContent || [];
    // Transform child states (replies and attachments)
    // This will put them in Storage
    for (var i=0, numChildren=childStates.length; i < numChildren; i++) {
        var thisReplyAndDescendants = this.transform(childStates[i], authors, opts);
        descendantContent.push.apply(descendantContent, thisReplyAndDescendants || []);
    }

    // Add any children that are awaiting the new content
    if (childContent.length) {
        this._addChildren(content, childContent);
    }

    // At this point, all content and children (recursively)
    // Are stored by ID
    // Attach attachments to their target, or store for later
    if (isAttachment) {
        this._attachOrStore(content, state.content.targetId);
    }
    // Add replies to their parent, or store for later
    if (isReply) {
        this._addReplyOrStore(content, state.content.parentId);
    }

    // Never return non-Content items or non-public items
    // But note, this is at the end of the recursive function,
    // so these items are still walked/processed, just not returned
    if ( ! isContent || ! isPublic) {
        return;
    }

    // Don't return replies if not explicitly specified
    if (isReply && ! opts.replies) {
        return;
    }

    if (opts.replies) {
        return [content].concat(descendantContent);
    }
    return [content];
};


StateToContent._addChildren = function (content, children) {
    var child;
    for (var i=0, numChildren=children.length; i < numChildren; i++) {
        child = children[i];
        if (child instanceof Oembed) {
            content.addAttachment(child);
        } else if (child instanceof LivefyreContent) {
            content.addReply(child);
        }
    }
};


StateToContent._createContent = function (state, authors) {
    var sourceName = StateToContent.enums.source[state.source],
        ContentType;
    state.author = authors && authors[state.content.authorId];

    if ('OEMBED' === StateToContent.enums.type[state.type]) {
        return new LivefyreOembed(state);
    } else if (sourceName === 'twitter') {
        return new LivefyreTwitterContent(state);
    } else if (sourceName === 'facebook') {
        return new LivefyreFacebookContent(state);
    } else if (sourceName === 'feed') {
        ContentType = LivefyreContent;
        // Use specific Content type for states from instagram RSS feeds
        if (isInstagramState(state)) {
            ContentType = LivefyreInstagramContent;
        }
        return new ContentType(state);
    } else if (sourceName === 'livefyre') {
        return new LivefyreContent(state);
    }
};


function isInstagramState (state) {
    var pattern = /\/\/instagram\.com/i;
    try {
        return state.content.feedEntry.channelId.match(pattern);
    } catch (err) {
        return false;
    }
}


/**
 * For a piece of Content, get the the properties and values that should
 * be used to update a previous version of that piece of Content
 * @param content {Content} A new version of a piece of Content,
 *     possible generated from a delete state, so it may not have a truthy
 *     .body and .attachments
 * @return {Object} A dict containing updated properties and their new value
 */
StateToContent._getUpdatedProperties = function(content) {
    var updatedProperties = {
        visibility: content.visibility
    };
    if (content.attachments && content.attachments.length) {
        updatedProperties.attachments = content.attachments;
    }
    if (content.body) {
        updatedProperties.body = content.body;
    }
    return updatedProperties;
};


StateToContent._attachOrStore = function (attachment, targetId) {
    var target = Storage.get(targetId);
    if (target) {
        log('attaching attachment', arguments);
        target.addAttachment(attachment);
    } else {
        log('storing attachment', arguments);
        this._storeChild(attachment, targetId);
    }
};


StateToContent._addReplyOrStore = function (reply, parentId) {
    var parent = Storage.get(parentId);
    if (parent) {
        log('adding reply', arguments);
        parent.addReply(reply);
    } else {
        log('storing reply', arguments);
        this._storeChild(reply, parentId);
    }
};


StateToContent._storeChild = function (child, parentId) {
    //TODO (joao) Make this smart enough to not push duplicates
    var childrenKey = 'children_' + parentId,
        children = Storage.get(childrenKey) || [];
    children.push(child);
    Storage.set(childrenKey, children);
};


StateToContent.enums = {};


StateToContent.enums.source = LivefyreContent.SOURCES;


 /**
 * The StreamHub APIs use enumerations to define
 * the type of message sent down the wire. All types
 * should be in this enumeration.
 * @enum types
 * @property {string} types.CONTENT - The good stuff. Juicy Content
 * like comments
 * @property {string} types.OPINE - A user's opinion or something
 * @property {string} types.SHARE - TODO: I don't know yet.
 * @property {string} types.OEMBED - A new attachment
 */
StateToContent.enums.type = [
    'CONTENT',
    'OPINE',
    'SHARE',
    'OEMBED'
];


StateToContent.Storage = Storage;
module.exports = StateToContent;