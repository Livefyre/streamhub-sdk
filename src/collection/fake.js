var EventEmitter = require('event-emitter');
var inherits = require('inherits');
var find = require('mout/array/find');

function FakeCollection(opts) {
    opts = opts || {};
    this.contents = [];
    this.more = opts.more;
    EventEmitter.apply(this, arguments);
}
inherits(FakeCollection, EventEmitter);

FakeCollection.prototype.add = function (content) {
    if (find(this.contents, {id: content.id})) {
        return;
    }

    // var idx = 0;
    // for (var i = 0; i < this.contents.length; i++) {
    //     if (content.createdAt > this.contents[i].createdAt) {
    //         break;
    //     }
    //     if (content.createdAt < this.contents[i].createdAt) {
    //         idx++;
    //     }
    // }

    this.contents.push(content);    
    // this.contents.splice(idx, 0, content);
    this.emit('added', content);
};

module.exports = FakeCollection;
