var $ = require('streamhub-sdk/jquery');
var Content = require('streamhub-sdk/content');
var ContentBodyView = require('streamhub-sdk/content/views/content-body-view');

'use strict';

describe('canTruncateBody mixin', function () {
    it('does not truncate by default', function () {
        var body = new ContentBodyView({content: {attachments: [], body: 'this is fun'}});
        body.render();
        expect(body.$el.find('.content-body-main').html().trim()).toEqual('<p>this is fun</p>');
    });

    it('does not truncate if enabled but body is not long enough', function () {
        var body = new ContentBodyView({
            content: {attachments: [], body: 'this is fun'},
            showMoreEnabled: true
        });
        body.render();
        expect(body.$el.find('.content-body-main').html().trim()).toEqual('<p>this is fun</p>');
    });

    it('truncates if enabled and body is long enough', function () {
        var body = new ContentBodyView({
            content: {attachments: [], body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla urna est, auctor ac laoreet ut, auctor vitae massa. Etiam sit amet consectetur arcu. Nunc hendrerit et tortor et tempor. Quisque mattis tellus sed hendrerit aliquam. Fusce id dignissim felis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce in finibus nisi. Maecenas a nisl a nibh euismod rutrum eu sit amet augue. Donec ac purus commodo, aliquet tellus molestie, efficitur odio. Etiam id vehicula lacus, varius consequat est. Mauris a tortor lacus. Maecenas eu ullamcorper tellus. Vestibulum finibus posuere velit, at pulvinar arcu faucibus ut. Proin placerat molestie elit ac ultrices.'},
            showMoreEnabled: true
        });
        body.render();
        expect(body.$el.find('.content-body-main').html().trim()).toEqual('<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla urna est, auctor ac laoreet ut, auctor vitae massa. Etiam sit…<a class="content-body-show-more view-more">View More</a></p>');
    });

    it('has "view more" when truncated', function () {
        var body = new ContentBodyView({
            content: {attachments: [], body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla urna est, auctor ac laoreet ut, auctor vitae massa. Etiam sit amet consectetur arcu. Nunc hendrerit et tortor et tempor. Quisque mattis tellus sed hendrerit aliquam. Fusce id dignissim felis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce in finibus nisi. Maecenas a nisl a nibh euismod rutrum eu sit amet augue. Donec ac purus commodo, aliquet tellus molestie, efficitur odio. Etiam id vehicula lacus, varius consequat est. Mauris a tortor lacus. Maecenas eu ullamcorper tellus. Vestibulum finibus posuere velit, at pulvinar arcu faucibus ut. Proin placerat molestie elit ac ultrices.'},
            showMoreEnabled: true
        });
        body.render();
        expect(body.$el.find('.view-more').length).toBe(1);
    });

    it('has "view less" when truncated and expanded', function () {
        var body = new ContentBodyView({
            content: {attachments: [], body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla urna est, auctor ac laoreet ut, auctor vitae massa. Etiam sit amet consectetur arcu. Nunc hendrerit et tortor et tempor. Quisque mattis tellus sed hendrerit aliquam. Fusce id dignissim felis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce in finibus nisi. Maecenas a nisl a nibh euismod rutrum eu sit amet augue. Donec ac purus commodo, aliquet tellus molestie, efficitur odio. Etiam id vehicula lacus, varius consequat est. Mauris a tortor lacus. Maecenas eu ullamcorper tellus. Vestibulum finibus posuere velit, at pulvinar arcu faucibus ut. Proin placerat molestie elit ac ultrices.'},
            showMoreEnabled: true
        });
        body.render();
        body.$el.find('.view-more').click();
        expect(body.$el.find('.view-less').length).toBe(1);
    });

    it('toggles the length of the body when clicking on the "view more" button', function () {
        var body = new ContentBodyView({
            content: {attachments: [], body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla urna est, auctor ac laoreet ut, auctor vitae massa. Etiam sit amet consectetur arcu. Nunc hendrerit et tortor et tempor. Quisque mattis tellus sed hendrerit aliquam. Fusce id dignissim felis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce in finibus nisi. Maecenas a nisl a nibh euismod rutrum eu sit amet augue. Donec ac purus commodo, aliquet tellus molestie, efficitur odio. Etiam id vehicula lacus, varius consequat est. Mauris a tortor lacus. Maecenas eu ullamcorper tellus. Vestibulum finibus posuere velit, at pulvinar arcu faucibus ut. Proin placerat molestie elit ac ultrices.'},
            showMoreEnabled: true
        });
        body.render();
        expect(body.$el.find('.content-body-main').html().trim()).toEqual('<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla urna est, auctor ac laoreet ut, auctor vitae massa. Etiam sit…<a class="content-body-show-more view-more">View More</a></p>');

        body.$el.find('.view-more').click();
        expect(body.$el.find('.content-body-main').html().trim()).toEqual('<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla urna est, auctor ac laoreet ut, auctor vitae massa. Etiam sit amet consectetur arcu. Nunc hendrerit et tortor et tempor. Quisque mattis tellus sed hendrerit aliquam. Fusce id dignissim felis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce in finibus nisi. Maecenas a nisl a nibh euismod rutrum eu sit amet augue. Donec ac purus commodo, aliquet tellus molestie, efficitur odio. Etiam id vehicula lacus, varius consequat est. Mauris a tortor lacus. Maecenas eu ullamcorper tellus. Vestibulum finibus posuere velit, at pulvinar arcu faucibus ut. Proin placerat molestie elit ac ultrices.<a class="content-body-show-more view-less">View Less</a></p>');

        body.$el.find('.view-less').click();
        expect(body.$el.find('.content-body-main').html().trim()).toEqual('<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla urna est, auctor ac laoreet ut, auctor vitae massa. Etiam sit…<a class="content-body-show-more view-more">View More</a></p>');
    });

    it('leaves html in-tact when truncating', function () {
        var body = new ContentBodyView({
            content: {attachments: [], body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla urna est, auctor ac laoreet ut, auctor vitae massa. <a href="http://google.com">Etiam sit amet consectetur arcu</a>. Nunc hendrerit et tortor et tempor. Quisque mattis tellus sed hendrerit aliquam. Fusce id dignissim felis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce in finibus nisi. Maecenas a nisl a nibh euismod rutrum eu sit amet augue. Donec ac purus commodo, aliquet tellus molestie, efficitur odio. Etiam id vehicula lacus, varius consequat est. Mauris a tortor lacus. Maecenas eu ullamcorper tellus. Vestibulum finibus posuere velit, at pulvinar arcu faucibus ut. Proin placerat molestie elit ac ultrices.'},
            showMoreEnabled: true
        });
        body.render();
        expect(body.$el.find('.content-body-main').html().trim()).toEqual('<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla urna est, auctor ac laoreet ut, auctor vitae massa. <a href="http://google.com">Etiam sit…</a><a class="content-body-show-more view-more">View More</a></p>');

        body = new ContentBodyView({
            content: {attachments: [], body: '<p>Nintendo set up a fantastic booth for Legend of Zelda: Breath of Wind here at E3 2016. Take a 360 tour of the booth in the video below.</p>'},
            showMoreEnabled: true
        });
        body.render();
        expect(body.$el.find('.content-body-main').html().trim()).toEqual('<p>Nintendo set up a fantastic booth for Legend of Zelda: Breath of Wind here at E3 2016. Take a 360 tour of the booth in the v…<a class="content-body-show-more view-more">View More</a></p>');
    });
});
