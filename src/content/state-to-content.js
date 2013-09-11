define([
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-twitter-content',
    'streamhub-sdk/content/types/livefyre-facebook-content',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/content/types/livefyre-oembed',
    'streamhub-sdk/content/types/livefyre-instagram-content',
    'streamhub-sdk/storage',
    'streamhub-sdk/debug',
    'stream/transform',
    'inherits'
], function (LivefyreContent, LivefyreTwitterContent, LivefyreFacebookContent,
Oembed, LivefyreOembed, LivefyreInstagramContent, Storage, debug, Transform,
inherits) {

    var log = debug('streamhub-sdk/content/state-to-content');

    /**
     * An Object that transforms state objects from Livefyre APIs
     * into streamhub-sdk Content instances
     */
    var StateToContent = function (opts) {
        opts = opts || {};
        this._authors = opts.authors || {};
        Transform.call(this, opts);
    }

    inherits(StateToContent, Transform);


    StateToContent.prototype._transform = function (state, done) {
        try {
            var authorId = state.content && state.content.authorId,
                content = StateToContent.transform(state, this._authors[authorId]);
        } catch (err) {
            this.emit('error transforming state-to-content', err);
            log('StateToContent.transform threw', err);
        }
        if (content) {
            this.push(content);
        }
        done();
    };


    /**
     * Creates the correct content type given the supplied "state".
     * @param state {Object} The livefyre content "state" as received by the
     *     client.
     * @return {LivefyreContent} A new, correctly typed, content object. 
     */
    StateToContent.transform = function (state, author) {
        var isPublic = (typeof state.vis === 'undefined') || (state.vis === 1),
            isReply = state.content.parentId,
            isAttachment = state.content.targetId,
            isContent = ('CONTENT' === StateToContent.enums.type[state.type]),
            childStates = state.childContent || [],
            content,
            childContent = [];

        content = StateToContent._createContent(state, author);

        // Store content with IDs in case we later get
        // replies or attachments targeting it
        if (content && content.id) {
            Storage.set(content.id, content);
            childContent = Storage.get('children_'+content.id) || [];
        }

        // Get child states (replies and attachments)
        childStates = state.childContent || [];
        // Transform child states (replies and attachments)
        // This will put them in Storage
        for (var i=0, numChildren=childStates.length; i < numChildren; i++) {
            childContent.push(this.transform(childStates[i]));
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
        

        // TODO: Allow for returning of replies
        if (isReply || isAttachment || ! isPublic) {
            return;
        }

        return content;
    }


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
    }


    StateToContent._createContent = function (state, author) {
        var sourceName = StateToContent.enums.source[state.source],
            ContentType;

        state.author = author;
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


    StateToContent._attachOrStore = function (attachment, targetId) {
        var target = Storage.get(targetId);
        if (target) {
            log('attaching attachment', arguments);
            target.addAttachment(attachment);
        } else {
            log('storing attachment', arguments);
            this._storeChild(attachment, targetId);
        }
    }


    StateToContent._addReplyOrStore = function (reply, parentId) {
        var parent = Storage.get(parentId);
        if (parent) {
            log('adding reply', arguments);
            parent.addReply(reply);
        } else {
            log('storing reply', arguments);
            this._storeChild(reply, parentId)
        }
    }


    StateToContent._storeChild = function (child, parentId) {
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
    return StateToContent;
});