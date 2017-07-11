var util = require('streamhub-sdk/util');
var EventEmitter = require('event-emitter');
var inherits = require('inherits');
var find = require('mout/array/find');

function SortedCollection() {
    EventEmitter.apply(this, arguments);

    /**
     * Container for all content that comes in.
     * @type {Array.<Content>}
     */
    this.contents = [];    
}
inherits(SortedCollection, EventEmitter);

/**
 * Add the content to the list by createdAt order.
 * @param {Content} content Content to add.
 */
SortedCollection.prototype.add = function (content) {
    if (find(this.contents, {id: content.id})) {
        return;
    }
    util.binaryInsert({
        array: this.contents,
        prop: 'meta.content.createdAt',
        value: content
    });
    this.emit('added', content);
};

module.exports = SortedCollection;