define(['inherits', 'event-emitter'], function(inherits, EventEmitter) {
    'use strict';
    
	/**
	 * A module to use for storing Content objects.
	 * @exports streamhub-sdk/storage
	 */
    var Storage = function() {
        this.cache = {}
        EventEmitter.call(this);
    };
    inherits(Storage, EventEmitter);
    
    /**
     * Gets an object from storage, using sync or async
     * @param key {String} the key lookup
     * @param callback {?function} optional callback to fire in async mode
     * @returns the value at the specified key position
     */
    Storage.prototype.get = function(key, callback) {
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
    Storage.prototype.set = function(key, value, callback) {
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
