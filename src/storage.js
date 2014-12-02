define(['streamhub-sdk/jquery', 'event-emitter'], function($, EventEmitter) {
    'use strict';
    
	/**
	 * A module to use for storing Content objects.
	 * @exports streamhub-sdk/storage
	 */
    var Storage = {
        cache: {}
    };
    EventEmitter.call(Storage);
    $.extend(Storage, EventEmitter.prototype);

    Storage.keys = {
        content: getContentStorageKey,
        contentChildren: getContentChildrenStorageKey
    };

    /**
     * Create a unique key for each piece of content/collection pair.
     * Not a content urn because that requires network and siteId, which
     * users of storage dont always have.
     */
    function getContentStorageKey(content) {
        var collection = content.collection || {};
        var template = "urn:liveyfre:collection={collection.id}:message={content.id}";
        var rendered = template
            .replace('{collection.id}', collection.id)
            .replace('{content.id}', content.id);
        return rendered;
    }

    function getContentChildrenStorageKey(content) {
        var key = 'children_'+getContentStorageKey(content);
        return key;
    }
    
    /**
     * Gets an object from storage, using sync or async
     * @param key {String} the key lookup
     * @param callback {?function} optional callback to fire in async mode
     * @returns the value at the specified key position
     */
    Storage.get = function(key, callback) {
        var result = this.cache[key];
        if (callback) {
            callback(result);
        } else {
            return result;
        }
    };

    /**
     * Sets an object to a key in storage, using sync or async
     * @param key {String} the key to store this under
     * @param value {Object} the value to store
     * @param callback {?function} optional callback to fire in async mode when complete
     */
    Storage.set = function(key, value, callback) {
        var obj = this.cache[key];
        this.cache[key] = value;
        
        if (obj) {
            this.emit('change', obj, value);
        } else {
            this.emit('add', value);
        }
        
        if (callback) {
            callback(value);
        } else {
            return value;
        }
    };

    return Storage;
});
