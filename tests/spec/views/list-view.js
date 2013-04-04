define([
    'jasmine',
    'jasmine-jquery',
    'jquery',
    'streamhub-sdk/views/list-view',
    'streamhub-sdk/content/content',
    'streamhub-sdk/stream',
    '../../mocks/jasmine-spy-stream'],
function (jasmine, jasmineJquery, $, ListView, Content, Stream, JasmineSpyStream) {
    describe('A ListView', function () {
        var fixtureId = 'sandbox',
            listView,
            el,
            $el;

        beforeEach(function () {
            spyOn(ListView.prototype, 'setElement').andCallThrough();

            listView = new ListView({
                streams: {
                    main: new JasmineSpyStream()
                }
            });
        });

        describe ("when constructed", function () {

            it ("is instanceof ListView", function () {
                expect(listView instanceof ListView).toBe(true);
            });

            it ("should call on() on all streams", function () {
                expect(listView.streams.main.on).toHaveBeenCalled();
                expect(listView.streams.main.on.callCount).toBe(1);
            });

            it ("has .content-list CSS class", function () {
                expect(listView.$el).toHaveClass('content-list');
            });

            it ("uses <ul> as the default .el HTML tag", function () {
                expect(listView.$el).toBe('ul');
            });

            // @todo move to base View ?

            it ("calls .setElement", function () {
                expect(listView.setElement).toHaveBeenCalled();
            });

            it ("has a .el with class of this.elClass", function () {
                expect(listView.$el).toHaveClass(listView.elClass);
            });

            it ("uses a .el with an HTML tag of this.elTag", function () {
                expect(listView.$el).toBe(listView.elTag);
            });

            describe("with opts.el", function () {

                beforeEach(function () {
                    setFixtures(sandbox());
                    $el = $('#'+fixtureId);
                    el = $el[0];

                    listView = new ListView({
                        el: el,
                        streams: {
                            main: new JasmineSpyStream()
                        }
                    });
                });

                it ("should have .el set to opts.el", function () {
                    expect(listView.el).toBe(el);
                });

                it ("should have .$el set to $(opts.el)", function () {
                    expect(listView.$el).toBe($el);
                });
            });
        });

        describe("when adding Content", function () {
            var content,
                newContentView;

            beforeEach(function () {
                setFixtures(sandbox());
                $el = $('#'+fixtureId);
                el = $el[0];

                listView = new ListView({
                    el: el,
                    streams: {
                        main: new JasmineSpyStream()
                    }
                });

                spyOn(listView, 'createContentView').andCallThrough();
                spyOn(listView, 'getContentView').andCallThrough();
                spyOn(listView, '_insertContentView').andCallThrough();

                content = new Content({
                    content: 'Say what'
                });
                newContentView = listView.add(content);
            });

            it("returns the new ContentView", function () {
                expect(newContentView instanceof listView.contentView).toBe(true);
            });

            describe("and ContentViews are created", function () {
                it("stores them in .contentViews", function () {
                    expect(listView.contentViews.length).toBe(1);
                    expect(listView.contentViews[0] instanceof listView.contentView).toBe(true);
                });

                it("uses .createContentView(content) to create the ContentViews", function () {
                    expect(listView.createContentView.callCount).toBe(1);
                    expect(listView.createContentView.mostRecentCall.args[0]).toBe(content);
                });

                it("the default .createContentView uses .getContentView(content) to get the ContentView constructor", function () {
                    expect(listView.getContentView.callCount).toBe(1);
                    expect(listView.getContentView.mostRecentCall.args[0]).toBe(content);
                });

                it("the default .getContentView(content) returns .contentView", function () {
                    expect(listView.getContentView()).toBe(listView.contentView);
                });
            });

            describe("and a ContentView is inserted", function () {
                it("calls ._insertContentView(contentView)", function () {
                    expect(listView._insertContentView.callCount).toBe(1);
                    expect(listView._insertContentView.mostRecentCall.args[0]).toBe(newContentView);
                });

                it("the new ContentView is in the DOM", function () {
                    expect(listView.$el).toContain(newContentView.$el);
                });
            });

        });

    });

    describe("Default ListView.prototype.contentView", function () {
        var contentView;

        beforeEach(function () {
            var ContentView = ListView.prototype.contentView;
            contentView = new ContentView('');
        });

        describe("when constructed", function () {
            it ("uses a <li> tag for .el", function () {
                expect(contentView.el).toBe('li')
            })
        });
    });
});
