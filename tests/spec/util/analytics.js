var analyticsUtil = require('streamhub-sdk/util/analytics');
var deepClone = require('mout/lang/deepClone');
var featuredFixtures = require('json!streamhub-sdk-tests/fixtures/featured-all.json');
var LivefyreContent = require('streamhub-sdk/content/types/livefyre-content');
var oembedFixtures = require('json!streamhub-sdk-tests/fixtures/oembeds.json');

describe('analytics utility', function () {
    describe('#contentObjectEntityFromModel', function () {
        it('works with LivefyreContent', function () {
            var content = new LivefyreContent(featuredFixtures.content[0]);
            expect(analyticsUtil.contentObjectEntityFromModel(content)).toEqual({
                type: 'Content',
                id: 'tweet-387987364657643520@twitter.com',
                contentGenerator: 'livefyre.com',
                isFeatured: true
            });
        });

        it('supports featured content', function () {
            var content = new LivefyreContent(featuredFixtures.content[0]);
            expect(analyticsUtil.contentObjectEntityFromModel(content)).toEqual({
                type: 'Content',
                id: 'tweet-387987364657643520@twitter.com',
                contentGenerator: 'livefyre.com',
                isFeatured: true
            });

            var cloned = deepClone(featuredFixtures.content[0]);
            delete cloned.content.annotations;
            content = new LivefyreContent(cloned);
            expect(analyticsUtil.contentObjectEntityFromModel(content)).toEqual({
                type: 'Content',
                id: 'tweet-387987364657643520@twitter.com',
                contentGenerator: 'livefyre.com',
                isFeatured: false
            });
        });

        it('supports parentId', function () {
            var cloned = deepClone(featuredFixtures.content[0]);
            cloned.content.parentId = '123';
            var content = new LivefyreContent(cloned);
            expect(analyticsUtil.contentObjectEntityFromModel(content)).toEqual({
                type: 'Content',
                id: 'tweet-387987364657643520@twitter.com',
                contentGenerator: 'livefyre.com',
                inReplyTo: '123',
                isFeatured: true
            });
        });

        it('supports attachments', function () {
            var cloned = deepClone(featuredFixtures.content[0]);
            cloned.content.attachments = [
                oembedFixtures.photo.instagram,
                oembedFixtures.video.instagram
            ];
            cloned.content.parentId = '123';
            var content = new LivefyreContent(cloned);
            var entity = analyticsUtil.contentObjectEntityFromModel(content);
            expect(entity.attachment.length).toBe(2);
            expect(entity.attachment).toEqual(cloned.content.attachments);
        });
    });

    describe('#oembedObjectEntityFromModel', function () {
        describe('works with', function () {
            describe('photos:', function () {
                it('filepicker', function () {
                    var oembed = oembedFixtures.photo.filepicker;
                    expect(analyticsUtil.oembedObjectEntityFromModel(oembed)).toEqual({
                        provider_name: 'LivefyreFilePicker',
                        type: 'photo',
                        url: 'http://dazfoe7f6de09.cloudfront.net/ClkZgZ8UQmwHZZMy4ShD_FSM-impastas.jpg',
                        version: '1.0'
                    });
                });

                it('instagram', function () {
                    var oembed = oembedFixtures.photo.instagram;
                    expect(analyticsUtil.oembedObjectEntityFromModel(oembed)).toEqual({
                        type: 'photo',
                        url: 'https://scontent.cdninstagram.com/t51.2885-15/s640x640/sh0.08/e35/12627845_1519342335027967_531938538_n.jpg',
                        version: '1.0'
                    });
                });
            });
            
            describe('rich media:', function () {
                it('soundcloud', function () {
                    var oembed = oembedFixtures.rich.soundcloud;
                    expect(analyticsUtil.oembedObjectEntityFromModel(oembed)).toEqual({
                        author_name: 'Musical Freedom Recs',
                        author_url: 'http://soundcloud.com/musical-freedom',
                        html: '<iframe class="embedly-embed" src="//cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fw.soundcloud.com%2Fplayer%2F%3Fvisual%3Dtrue%26url%3Dhttp%253A%252F%252Fapi.soundcloud.com%252Ftracks%252F260022383%26show_artwork%3Dtrue&wmode=transparent&url=https%3A%2F%2Fsoundcloud.com%2Fmusical-freedom%2Ftiesto-ummet-ozcan-what-youre-waiting-for-may-9&image=http%3A%2F%2Fi1.sndcdn.com%2Fartworks-000159064689-hmskkh-t500x500.jpg&key=9a490b23ba72460b82aa369e9dfb1234&type=text%2Fhtml&schema=soundcloud" width="500" height="500" scrolling="no" frameborder="0" allowfullscreen></iframe>',
                        provider_name: 'SoundCloud',
                        provider_url: 'http://soundcloud.com',
                        thumbnail_height: 500,
                        thumbnail_url: 'http://i1.sndcdn.com/artworks-000159064689-hmskkh-t500x500.jpg',
                        thumbnail_width: 500,
                        title: 'Tiësto & Ummet Ozcan - What You\'re Waiting For [Available May 9] by Musical Freedom Recs',
                        type: 'rich',
                        url: 'https://soundcloud.com/musical-freedom/tiesto-ummet-ozcan-what-youre-waiting-for-may-9',
                        version: '1.0'
                    });
                });
            });

            describe('videos:', function () {
                it('instagram', function () {
                    var oembed = oembedFixtures.video.instagram;
                    expect(analyticsUtil.oembedObjectEntityFromModel(oembed)).toEqual({
                        html: '<iframe src="//api.embed.ly/1/video?width=490&height=490&mp4=https://scontent.cdninstagram.com/hphotos-xtp1/t50.2886-16/12078856_856907221083570_102451330_n.mp4&poster=https://scontent.cdninstagram.com/hphotos-xpt1/t51.2885-15/s150x150/e15/11910456_443791672476794_1778395696_n.jpg}&schema=instagram" frameborder=0 allowfullscreen></iframe>',
                        thumbnail_url: 'https://scontent.cdninstagram.com/hphotos-xpt1/t51.2885-15/s150x150/e15/11910456_443791672476794_1778395696_n.jpg',
                        type: 'video',
                        version: '1.0'
                    });
                });

                it('livefyre', function () {
                    var oembed = oembedFixtures.video.livefyre;
                    expect(analyticsUtil.oembedObjectEntityFromModel(oembed)).toEqual({
                        html: '<iframe frameborder="0" allowfullscreen src="//cdn.livefyre.com/libs/video-player/v1.0.0/player.html?data=%7B%22Outputs%22%3A%5B%7B%22Thumbnail%22%3A%22thumbnails%2Fhi%2FNiGNbEkQRNqKNaSsODrI_VIDEO0001-00001.png%22%2C%22Key%22%3A%22hi%2FNiGNbEkQRNqKNaSsODrI_VIDEO0001.mp4%22%7D%2C%7B%22Thumbnail%22%3A%22thumbnails%2Fmobile%2FNiGNbEkQRNqKNaSsODrI_VIDEO0001-00001.png%22%2C%22Key%22%3A%22mobile%2FNiGNbEkQRNqKNaSsODrI_VIDEO0001.mp4%22%7D%5D%2C%22Domain%22%3A%22media.fyre.co%22%2C%22Prefix%22%3A%22staging%2Fmp4%2F%22%7D" width="640" height="360"></iframe>',
                        provider_name: 'Livefyre',
                        thumbnail_height: 360,
                        thumbnail_url: 'http://media.fyre.co/staging/mp4/thumbnails/hi/NiGNbEkQRNqKNaSsODrI_VIDEO0001-00001.png',
                        thumbnail_width: 640,
                        type: 'video',
                        url: 'http://media.fyre.co/NiGNbEkQRNqKNaSsODrI_VIDEO0001.3gp',
                        version: '1.0'
                    });
                });

                it('youtube', function () {
                    var oembed = oembedFixtures.video.youtube;
                    expect(analyticsUtil.oembedObjectEntityFromModel(oembed)).toEqual({
                        author_name: 'CaptainSparklez',
                        author_url: 'http://www.youtube.com/user/CaptainSparklez',
                        html: '<iframe width="854" height="480" src="http://www.youtube.com/embed/fkvyHk6uMZ4?feature=oembed" frameborder="0" allowfullscreen></iframe>',
                        provider_name: 'YouTube',
                        provider_url: 'http://www.youtube.com/',
                        thumbnail_height: 360,
                        thumbnail_url: 'http://i3.ytimg.com/vi/fkvyHk6uMZ4/hqdefault.jpg',
                        thumbnail_width: 480,
                        title: 'Minecraft: Adobe Houses, Multiplying Zombies, And More! (Snapshot 13w17a)',
                        type: 'video',
                        url: 'http://www.youtube.com/watch?v=fkvyHk6uMZ4',
                        version: '1.0'
                    });
                });
            });
        });
    });
});
