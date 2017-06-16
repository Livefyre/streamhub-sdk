var util = require('streamhub-sdk/content/util/main');

describe('content/util', function () {
    describe('getContentPermalink', function () {
        it('returns permalink for twitter', function () {
            expect(util.getContentPermalink('twitter', {
                tweetId: '123'
            }))
            .toBe('https://twitter.com/statuses/123');
        });

        it('returns permalink for instagram', function () {
            expect(util.getContentPermalink('instagram', {
                attachments: [{
                    link: 'https://instagram.com/media.png',
                    provider_name: 'instagram'
                }]
            }))
            .toBe('https://instagram.com/media.png');
        });

        it('return permalink for facebook', function () {
            expect(util.getContentPermalink('facebook', {
                attachments: [{
                    link: 'https://facebook.com/media.png',
                    provider_name: 'facebook'
                }]
            }))
            .toBe('https://facebook.com/media.png');
        });

        it('returns undefined if no attachments', function () {
            expect(util.getContentPermalink('facebook', {}))
            .toBe(undefined);

            expect(util.getContentPermalink('facebook', {
                attachments: []
            }))
            .toBe(undefined);
        });

        it('returns undefined if unsupported media provider', function () {
            expect(util.getContentPermalink('facebook', {
                attachments: [{
                    link: 'https://facebook.com/media.png',
                    provider_name: 'youtube'
                }]
            }))
            .toBe(undefined);
        });

        it('returns undefined if invalid url', function () {
            expect(util.getContentPermalink('facebook', {
                attachments: [{
                    link: 'https://xyz.facebook.com/media.png',
                    provider_name: 'facebook'
                }]
            }))
            .toBe(undefined);
        });
    });
});
