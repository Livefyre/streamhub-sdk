var $ = require('streamhub-sdk/jquery');
var deepClone = require('mout/lang/deepClone');
var oembedFixtures = require('json!streamhub-sdk-tests/fixtures/oembeds.json');
var OembedView = require('streamhub-sdk/content/views/oembed-view');
var VideoOembedView = require('streamhub-sdk/content/views/oembed/video');

'use strict';

describe('VideoOembedView', function () {
    describe('#constructor', function () {
        it('initializes instance variables', function () {
            var view = new VideoOembedView({oembed: oembedFixtures.video.youtube});
            expect(view._autoplaySupported).toBe(false);
            expect(view._frameClickInterval).toBe(null);
            expect(view._playing).toBe(false);
            expect(view._showVideo).toBe(false);
        });

        it('takes a `showVideo` option to determine if the video should be rendered', function () {
            var view = new VideoOembedView({
                oembed: oembedFixtures.video.youtube,
                showVideo: true
            });
            expect(view._showVideo).toBe(true);
        });
    });

    describe('#getEmbedHtml', function () {
        it('returns the html if there is no iframe', function () {
            var oembed = deepClone(oembedFixtures.video.youtube);
            oembed.html = '<h2>something</h2>';
            var view = new VideoOembedView({oembed: oembed});
            expect(view.getEmbedHtml()).toEqual('<h2>something</h2>');
        });

        it('modifies the iframe src if it is an iframe', function () {
            var view = new VideoOembedView({oembed: oembedFixtures.video.youtube});
            spyOn(view, 'modifyIframeSource');
            view.getEmbedHtml();
            expect(view.modifyIframeSource).toHaveBeenCalled();
        });

        it('adds autoplay param if supported', function () {
            var view = new VideoOembedView({oembed: oembedFixtures.video.youtube});
            view._autoplaySupported = true;
            expect(view.getEmbedHtml().indexOf('autoplay=1') > -1).toBe(true);
        });
    });

    describe('#initializeIframeTracker', function () {
        it('does nothing if there is no iframe', function () {
            var oembed = deepClone(oembedFixtures.video.youtube);
            oembed.html = '<h2>something</h2>';
            var view = new VideoOembedView({oembed: oembed, showVideo: true});
            spyOn(view.$el, 'on').andCallThrough();
            view.render();
            expect(view.$el.on).not.toHaveBeenCalled();
        });

        it('handles iframe focus events', function () {
            var view = new VideoOembedView({
                oembed: oembedFixtures.video.youtube,
                showVideo: true
            });

            spyOn(view.$el, 'on').andCallThrough();
            spyOn(view, 'trackPlay').andCallThrough();

            view.render();
            expect(view.$el.on).toHaveBeenCalled();
            document.body.appendChild(view.el);

            var focused = false;

            runs(function () {
                view.$el.trigger('mouseover');
                view.$el.find('iframe').focus();

                setTimeout(function () {
                    view.$el.trigger('mouseout');
                    focused = true;
                }, 300);
            });

            waitsFor(function () {
                return focused;
            }, 'the focus to complete');

            runs(function () {
                expect(view.trackPlay).toHaveBeenCalled();
                expect(view._hasSentPlay).toBe(true);
                expect(view._playing).toBe(true);
                expect(view._frameClickInterval).toBe(null);
                document.body.removeChild(view.el);
            });
        });
    });

    describe('#maybePlay', function () {
        it('plays if autoplay is supported', function () {
            var view = new VideoOembedView({oembed: oembedFixtures.video.youtube});
            spyOn(view, 'trackPlay');
            view._autoplaySupported = true;
            view.maybePlay();
            expect(view.trackPlay).toHaveBeenCalled();
            expect(view._playing).toBe(true);
        });

        it('does not play if autoplay is not supported', function () {
            var view = new VideoOembedView({oembed: oembedFixtures.video.youtube});
            spyOn(view, 'trackPlay');
            view.maybePlay();
            expect(view.trackPlay).not.toHaveBeenCalled();
            expect(view._playing).toBe(false);
        });
    });

    describe('#modifyIframeSource', function () {
        var iframe, view;

        beforeEach(function () {
            iframe = $(oembedFixtures.video.youtube.html)[0];
            view = new VideoOembedView({oembed: oembedFixtures.video.youtube});
        });

        it('does not modify the source if autoplay is disabled', function () {
            view.modifyIframeSource(iframe);
            expect(iframe.src.indexOf('autoplay=1') === -1).toBe(true);
        });

        it('adds a query param if autoplay is enabled', function () {
            view._autoplaySupported = true;
            view.modifyIframeSource(iframe);
            expect(iframe.src.indexOf('autoplay=1') > -1).toBe(true);
        });
    });

    describe('#render', function () {
        it('renders a video if the `_showVideo` var is set', function () {
            var view = new VideoOembedView({
                oembed: oembedFixtures.video.youtube,
                showVideo: true
            });
            spyOn(view, 'renderVideo');
            spyOn(OembedView.prototype, 'render');
            view.render();
            expect(view.renderVideo).toHaveBeenCalled();
            expect(OembedView.prototype.render).not.toHaveBeenCalled();
        });

        it('renders normally if `_showVideo` is not set', function () {
            var view = new VideoOembedView({oembed: oembedFixtures.video.youtube});
            spyOn(view, 'renderVideo');
            spyOn(OembedView.prototype, 'render');
            view.render();
            expect(view.renderVideo).not.toHaveBeenCalled();
            expect(OembedView.prototype.render).toHaveBeenCalled();
        });
    });

    describe('#renderVideo', function () {
        var view;

        beforeEach(function () {
            view = new VideoOembedView({
                oembed: oembedFixtures.video.youtube,
                showVideo: true
            });
        });

        it('renders the template and hides photo elements', function () {
            view.renderVideo();
            expect(view.$el.find('.content-attachment-photo:hidden').length).toEqual(1);
            expect(view.$el.find('.content-attachment-controls-play:hidden').length).toEqual(1);
        });

        it('adds the embed html', function () {
            view.renderVideo();
            expect(view.$el.find('.content-attachment-video').children().length).toEqual(1);
        });

        it('resizes the video', function () {
            spyOn(view, 'resizeVideo');
            view.renderVideo();
            expect(view.resizeVideo).toHaveBeenCalled();
        });

        it('initializes the iframe tracker if autoplay is not supported', function () {
            spyOn(view, 'initializeIframeTracker');
            view._autoplaySupported = true;
            view.renderVideo();
            expect(view.initializeIframeTracker).not.toHaveBeenCalled();

            view._autoplaySupported = false;
            view.renderVideo();
            expect(view.initializeIframeTracker).toHaveBeenCalled();
        });
    });

    describe('#resizeVideo', function () {
        var iframe, view;

        beforeEach(function () {
            var oembed = deepClone(oembedFixtures.video.youtube);
            delete oembed.height;
            delete oembed.width;

            view = new VideoOembedView({oembed: oembed, showVideo: true});
            view.render();

            iframe = view.$el.find('iframe')[0];
            iframe.removeAttribute('height');
            iframe.removeAttribute('width');
        });

        it('does nothing if height and width are not set', function () {
            view.resizeVideo();
            expect(iframe.getAttribute('height')).toBe(null);
            expect(iframe.getAttribute('width')).toBe(null);
        });

        it('sets the height and width attributes if set', function () {
            view.oembed.height = 666;
            view.oembed.width = 666;
            view.resizeVideo();
            expect(parseInt(iframe.getAttribute('height'), 10)).toEqual(666);
            expect(parseInt(iframe.getAttribute('width'), 10)).toEqual(666);
        });
    });

    describe('#trackPlay', function () {
        it('triggers a DOM event if has not already been sent', function () {
            var view = new VideoOembedView({oembed: oembedFixtures.video.youtube});
            spyOn(view.$el, 'trigger');
            view.trackPlay();
            expect(view.$el.trigger).toHaveBeenCalled();
            expect(view._hasSentPlay).toBe(true);
        });

        it('does nothing if already sent', function () {
            var view = new VideoOembedView({oembed: oembedFixtures.video.youtube});
            view._hasSentPlay = true;
            spyOn(view.$el, 'trigger');
            view.trackPlay();
            expect(view.$el.trigger).not.toHaveBeenCalled();
        });
    });
});
