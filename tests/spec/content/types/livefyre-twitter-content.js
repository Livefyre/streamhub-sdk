define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/content/types/livefyre-twitter-content',
    'json!streamhub-sdk-tests/fixtures/verified-tweet-state.json',
    'json!streamhub-sdk-tests/fixtures/unverified-tweet-state.json'],
function ($, LivefyreTwitterContent, verifiedTweetState, unverifiedTweetState) {
    'use strict';

    describe('A LivefyreTwitterContent object', function () {
        it('has .twitterVerified if the content author is a verified twitter user', function () {
            var content = new LivefyreTwitterContent(verifiedTweetState);
            expect(content.twitterVerified).toBe(true);
        });
        it('is not .twitterVierifed if the content author is not a verified twitter user', function () {
            var content = new LivefyreTwitterContent(unverifiedTweetState);
            expect(content.twitterVerified).toBe(false);
        });
    });
});
