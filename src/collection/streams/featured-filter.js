var inherits = require('inherits');
var Transform = require('stream/transform');

var FeaturedFilter = function (opts) {
    opts = opts || {};
    Transform.apply(this, arguments);
};
inherits(FeaturedFilter, Transform);

FeaturedFilter.prototype._transform = function (content, done) {
    if (content.featured) {
        this.push(content);
    }
    done();
};

module.exports = FeaturedFilter;
