define([
    'jquery',
    'streamhub-sdk/stream',
    'streamhub-sdk/content/content',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/twitter-search-content'
], function ($, Stream, Content, LivefyreContent, TwitterSearchContent) {

    /**
     * A MockStream of Content
     */
    var MockStream = function MockStream (opts) {
        Stream.call(this);
        opts = opts || {};
        this.interval = opts.interval || 1000;
        this.timeout = null;
    };
    $.extend(MockStream.prototype, Stream.prototype);

    MockStream.prototype.mocks = [
        new Content('Bar'),
        new Content('Foo')];

    MockStream.prototype._read = function() {
        this._push(this.mocks[Math.floor(Math.random() * this.mocks.length)]);
        this._endRead();
        var self = this;
        this.timeout = setTimeout(function () { self._read(); }, self.interval);
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
    };

    MockLivefyreContentStream.prototype = new MockStream();

    MockLivefyreContentStream.prototype.mocks = [
        new LivefyreContent(mockData.livefyreBootstrapContent),
        new LivefyreContent(mockData.livefyreStreamContent)
    ];

    /**
     * A MockStream of TwitterContent
     */

    MockStream.TwitterContent = MockTwitterContentStream;

    mockData.twitterSearch =  {      "created_at": "Tue, 02 Apr 2013 03:13:11 +0000",      "entities": {        "hashtags": [                  ],        "urls": [                  ],        "user_mentions": [          {            "screen_name": "OneFMKe",            "name": "OneFM 97.1",            "id": 190200069,            "id_str": "190200069",            "indices": [              3,              11            ]          }        ]      },      "from_user": "SalivaVic",      "from_user_id": 16293574,      "from_user_id_str": "16293574",      "from_user_name": "Saliva Vic ",      "geo": null,      "id": 3.189240398444e+17,      "id_str": "318924039844397056",      "iso_language_code": "en",      "metadata": {        "result_type": "recent"      },      "profile_image_url": "http:\\/\\/a0.twimg.com\\/profile_images\\/2450858508\\/8dwe9qe54q8qzg5vahk0_normal.jpeg",      "profile_image_url_https": "https:\\/\\/si0.twimg.com\\/profile_images\\/2450858508\\/8dwe9qe54q8qzg5vahk0_normal.jpeg",      "source": "&lt;a href=&quot;http:\\/\\/twitter.com\\/&quot;&gt;web&lt;\\/a&gt;",      "text": "RT @OneFMKe: Kuna Watu aina Kadhaa duniani! Those who make things happen-Those who watch things happen-Those who wonder what happened.Wewe Ni type gani.."    };

    function MockTwitterContentStream (opts) {
        MockStream.call(this, opts);
    }
    MockTwitterContentStream.prototype = new MockStream();

    MockTwitterContentStream.prototype.mocks = [
        new TwitterSearchContent(mockData.twitterSearch)
    ]
    return MockStream;
});
