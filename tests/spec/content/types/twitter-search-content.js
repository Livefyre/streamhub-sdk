define([
    'jquery',
    'jasmine',
    'streamhub-sdk/content/types/twitter-content',
    'streamhub-sdk/content/types/twitter-search-content',
    'jasmine-jquery'],
function ($, jasmine, TwitterContent, TwitterSearchContent, jasmineJquery) {
    describe('A TwitterSearchContent object', function () {
        var mockData = {      "created_at": "Tue, 02 Apr 2013 03:13:11 +0000",      "entities": {        "hashtags": [                  ],        "urls": [                  ],        "user_mentions": [          {            "screen_name": "OneFMKe",            "name": "OneFM 97.1",            "id": 190200069,            "id_str": "190200069",            "indices": [              3,              11            ]          }        ]      },      "from_user": "SalivaVic",      "from_user_id": 16293574,      "from_user_id_str": "16293574",      "from_user_name": "Saliva Vic ",      "geo": null,      "id": 3.189240398444e+17,      "id_str": "318924039844397056",      "iso_language_code": "en",      "metadata": {        "result_type": "recent"      },      "profile_image_url": "http:\\/\\/a0.twimg.com\\/profile_images\\/2450858508\\/8dwe9qe54q8qzg5vahk0_normal.jpeg",      "profile_image_url_https": "https:\\/\\/si0.twimg.com\\/profile_images\\/2450858508\\/8dwe9qe54q8qzg5vahk0_normal.jpeg",      "source": "&lt;a href=&quot;http:\\/\\/twitter.com\\/&quot;&gt;web&lt;\\/a&gt;",      "text": "RT @OneFMKe: Kuna Watu aina Kadhaa duniani! Those who make things happen-Those who watch things happen-Those who wonder what happened.Wewe Ni type gani.."    };
        it ("can be constructed from a twitter search response", function () {
            var tweetContent = new TwitterSearchContent(mockData);
            expect(tweetContent instanceof TwitterContent).toBe(true);
            expect(tweetContent instanceof TwitterSearchContent).toBe(true);
            expect(tweetContent.tweetId).toBe(mockData.id_str);
            expect(tweetContent.html()).toBe(mockData.text);
            expect(tweetContent.author.twitterUserId).toBe(mockData.from_user_id_str);
            expect(tweetContent.author.displayName).toBe(mockData.from_user);
            expect(tweetContent.createdAt.getTime()).toBe((new Date(mockData.created_at)).getTime());
        });
    });
});