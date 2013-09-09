define([
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-twitter-content',
    'streamhub-sdk/content/types/livefyre-facebook-content',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/content/types/livefyre-oembed',
    'streamhub-sdk/storage',
    'streamhub-sdk/debug',
    'stream/transform',
    'inherits'
], function (LivefyreContent, LivefyreTwitterContent, LivefyreFacebookContent,
Oembed, LivefyreOembed, Storage, debug, Transform, inherits) {

    var log = debug('streamhub-sdk/content/state-to-content');

	/**
	 * An Object that transforms state objects from Livefyre APIs
	 * into streamhub-sdk Content instances
	 */
	function StateToContent (opts) {
		opts = opts || {};
		this._authors = opts.authors || {};
        Transform.call(this, opts);
	}

    inherits(StateToContent, Transform);


	StateToContent.prototype._transform = function (state, done) {
        var content = this.__transform(state);
        if (content) {
            this.push(content);
        }
        done();
	};

    StateToContent.prototype.__transform = function (state) {
        try {
            var authorId = state.content && state.content.authorId,
                content = StateToContent.transform(state, this._authors[authorId]);
        } catch (err) {
            this.emit('error transforming state-to-content', err);
            log('StateToContent.transform thew', err);
        }
        return content;
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
            isContent = (state.type === 0),
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
        var sourceName = StateToContent.enums.source[state.source];

        state.author = author;

        if (state.type === 3) {
            return new LivefyreOembed(state);
        } else if (sourceName === 'twitter') {
            return new LivefyreTwitterContent(state);
        } else if (sourceName === 'facebook') {
            return new LivefyreFacebookContent(state);
        } else if (['livefyre','feed'].indexOf(sourceName) !== -1) {
            return new LivefyreContent(state);
        }
    };


    StateToContent._attachOrStore = function (attachment, targetId) {
        var target = Storage.get(targetId);
        if (target) {
            log('attachming attatment', arguments);
            target.addAttachment(attachment);
        } else {
            log('storing attatment', arguments);
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


    StateToContent.enums.source = [
        "livefyre", 
        "twitter",
        "twitter",
        "facebook",
        "livefyre",
        "livefyre",
        "facebook",
        "twitter",
        "livefyre",
        "unknown",
        "unknown",
        "unknown",
        "unknown",
        "feed",
        "facebook"
    ];

    StateToContent.Storage = Storage;
	return StateToContent;
});