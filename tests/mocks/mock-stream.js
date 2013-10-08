define([
    'streamhub-sdk/jquery',
    'stream/readable',
    'streamhub-sdk/content',
    'streamhub-sdk/content/types/livefyre-content',
    'inherits'
], function ($, Readable, Content, LivefyreContent, inherits) {

    /**
     * A MockStream of Content
     */
    var MockStream = function MockStream (opts) {
        Readable.call(this);
        opts = opts || {};
        this.mocks = opts.mocks || this.mocks;
        this.interval = opts.interval || 1000;
        this.timeout = null;
        this.writeLatency = opts.writeLatency || 0;
    };
    inherits(MockStream, Readable);

    MockStream.prototype.mocks = [
        new Content('Bar'),
        new Content('Foo')];

    MockStream.prototype._read = function() {
        var self = this;
        var content = Object.create(this.mocks[Math.floor(Math.random() * this.mocks.length)]);
        content.id = (new Date().getTime());
        setTimeout(function () {
            self.push(content);
        }, self.interval);
    };

    /**
     * A MockStream of LivefyreContent
     */
    MockStream.LivefyreContent = MockLivefyreContentStream;

    var mockData = {};
    mockData.livefyreBootstrapContent = {"source": 1, "content": {"replaces": "", "parentId": "", "bodyHtml": "oh hi there", "id": "tweet-308584114829795328@twitter.com", "authorId": "890999516@twitter.com", "updatedAt": 1362407161, "annotations": {}, "createdAt": 1362407161}, "vis": 1, "type": 0, "event": 1362407161286515, "childContent": [], author: {displayName: "sara",tags: [ ],profileUrl: "https://twitter.com/#!/135sara",avatar: "http://a0.twimg.com/profile_images/1349672055/Baqueira_29-01-2010_13-54-52_normal.jpg",type: 3,id: "123568642@twitter.com"}};
    mockData.livefyreStreamContent = {"vis": 1, "content": {"replaces": "", "feedEntry": {"transformer": "lfcore.v2.procurement.feed.transformer.instagram", "feedType": 2, "description": "#gayrights #lgbt #equality #marriageequality <img src=\"http://distilleryimage2.instagram.com/18ea2500970c11e294f522000a9f30b8_7.jpg\" />", "pubDate": 1364409052, "channelId": "http://instagram.com/tags/marriageequality/feed/recent.rss", "link": "http://distilleryimage2.instagram.com/18ea2500970c11e294f522000a9f30b8_7.jpg", "id": "bffcb85a-2976-4396-bb60-3cf5b1e2c3a8", "createdAt": 1364409052}, "bodyHtml": "#gayrights #lgbt #equality #marriageequality ", "annotations": {}, "authorId": "7759cd005d95d8cc5bd93718b2ac0064@instagram.com", "parentId": "", "updatedAt": 1364409052, "id": "bffcb85a-2976-4396-bb60-3cf5b1e2c3a8", "createdAt": 1364409052}, "source": 13, "lastVis": 0, "type": 0, "event": 1364409052662964, author: {displayName: "sara",tags: [ ],profileUrl: "https://twitter.com/#!/135sara",avatar: "http://a0.twimg.com/profile_images/1349672055/Baqueira_29-01-2010_13-54-52_normal.jpg",type: 3,id: "123568642@twitter.com"}};

    function MockLivefyreContentStream (opts) {
        MockStream.call(this, opts);
    }

    MockLivefyreContentStream.prototype = new MockStream();

    MockLivefyreContentStream.prototype.mocks = [
        new LivefyreContent(mockData.livefyreBootstrapContent),
        new LivefyreContent(mockData.livefyreStreamContent)
    ];

    return MockStream;
});
