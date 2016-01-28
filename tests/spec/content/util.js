define([
    'streamhub-sdk/content/util'],
function (util) {
    'use strict';

    describe('streamhub-sdk/content/util', function () {
        describe('inAnchor', function () {
            it('returns false if not within an anchor', function () {
                var str = '<p>abc <a href="http://www.blah.com">http://www.blah.com</a> def</p>';
                expect(util.inAnchor(str, 5)).toBe(null);
            });

            it('returns true if within an anchor', function () {
                var str = '<p>abc <a href="http://www.blah.com">http://www.blah.com</a> def</p>';
                expect(util.inAnchor(str, 15)).toEqual({
                    startIndex: 7,
                    endIndex: 60
                });
            });
        });

        describe('linkify', function () {
            it('does nothing if there are no urls', function () {
                expect(util.linkify('abc def')).toEqual('abc def');
                expect(util.linkify('<p>abc def</p>')).toEqual('<p>abc def</p>');
            });

            it('does not linkify urls within anchors', function () {
                var str = '<p>abc <a href="http://www.blah.com">http://www.blah.com</a> def</p>';
                expect(util.linkify(str)).toEqual(str);

                str = '<p>Watch as I put together an amazing Star Wars Themed Gift thanks to Hallmark! (ad): <a href="https://ooh.li/913875d" target="_blank" rel="nofollow">https://ooh.li/913875d</a> Full tutorial: <a href="http://raisingwhasians.com/2015/11/star-wars-hot-cocoa-holiday-gift-idea-c-3po-marshmallows.html" target="_blank" rel="nofollow">http://raisingwhasians.com/2015/11/star-wars-hot-cocoa-holiday-gift-idea-c-3po-marshmallows.html</a></p>';
                expect(util.linkify(str)).toEqual(str);
            });

            it('linkifies a single url', function () {
                var expected = '<p>abc <a href="http://www.blah.com" target="_blank" rel="nofollow">http://www.blah.com</a> def';
                expect(util.linkify('<p>abc http://www.blah.com def')).toEqual(expected);
            });

            it('linkifies multiple urls', function () {
                var expected = '<p>abc <a href="http://www.blah.com" target="_blank" rel="nofollow">http://www.blah.com</a> <a href="http://google.com" target="_blank" rel="nofollow">http://google.com</a> def';
                expect(util.linkify('<p>abc http://www.blah.com http://google.com def')).toEqual(expected);
            });

            it('works in various conditions', function () {
                var str = '<p>http://google.com</p>';
                expect(util.linkify(str)).toEqual('<p><a href="http://google.com" target="_blank" rel="nofollow">http://google.com</a></p>');

                str = '<p>abc:http://google.com</p>';
                expect(util.linkify(str)).toEqual('<p>abc:<a href="http://google.com" target="_blank" rel="nofollow">http://google.com</a></p>');

                str = '<p>"abc"http://google.com</p>';
                expect(util.linkify(str)).toEqual('<p>"abc"<a href="http://google.com" target="_blank" rel="nofollow">http://google.com</a></p>');

                str = '<p><a href="http://google.com" target="_blank" rel="nofollow">http://google.com</a> http://google.com</p>';
                expect(util.linkify(str)).toEqual('<p><a href="http://google.com" target="_blank" rel="nofollow">http://google.com</a> <a href="http://google.com" target="_blank" rel="nofollow">http://google.com</a></p>');

                str = '<a href="https://twitter.com/#!/search/realtime/%23Realtors" class="fyre-hashtag" hashtag="Realtors" rel="tag" target="_blank">#Realtors</a> high quality remake of <a href="https://twitter.com/#!/search/realtime/%23Adele" class="fyre-hashtag" hashtag="Adele" rel="tag" target="_blank">#Adele</a> \'s <a href="https://twitter.com/#!/search/realtime/%23Hello" class="fyre-hashtag" hashtag="Hello" rel="tag" target="_blank">#Hello</a>. Hilarious lyric customization <a href="https://t.co/JL06YLfggW" target="_blank" rel="nofollow">youtube.com/watch</a>? v=X8EF1cY35KY&amp;sns=tw <a href="https://twitter.com/#!/search/realtime/%23realestate" class="fyre-hashtag" hashtag="realestate" rel="tag" target="_blank">#realestate</a>';
                expect(util.linkify(str)).toEqual(str);

                str = '<a href="https://twitter.com/#!/search/realtime/%23TodosSomosChiqui" class="fyre-hashtag" hashtag="TodosSomosChiqui" rel="tag" target="_blank">#TodosSomosChiqui</a> <a href="https://twitter.com/#!/search/realtime/%23SaludosSecundariaAnexa" class="fyre-hashtag" hashtag="SaludosSecundariaAnexa" rel="tag" target="_blank">#SaludosSecundariaAnexa</a> <a vocab="http://schema.org" typeof="Person" rel="nofollow" resource="acct:163521165@twitter.com" data-lf-handle="" data-lf-provider="twitter" property="url" href="https://twitter.com/#!/los40mx" target="_blank" class="fyre-mention fyre-mention-twitter">@<span property="name">los40mx</span></a> <a href="https://twitter.com/#!/search/realtime/%23YAPARATE" class="fyre-hashtag" hashtag="YAPARATE" rel="tag" target="_blank">#YAPARATE</a> <a href="https://twitter.com/#!/search/realtime/%23ProyectoClase" class="fyre-hashtag" hashtag="ProyectoClase" rel="tag" target="_blank">#ProyectoClase</a> <a href="https://twitter.com/#!/search/realtime/%23Listen" class="fyre-hashtag" hashtag="Listen" rel="tag" target="_blank">#Listen</a>  <a href="https://twitter.com/#!/search/realtime/%23Hello" class="fyre-hashtag" hashtag="Hello" rel="tag" target="_blank">#Hello</a>';
                expect(util.linkify(str)).toEqual(str);

                str = '<a href="http://google.com" target="_blank"><span>something</span></a> derp';
                expect(util.linkify(str)).toEqual(str);
            });
        });
    });
});
