define([
    'jasmine',
    'jasmine-jquery',
    'streamhub-sdk/jquery',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-sdk/content',
    'streamhub-sdk/content/views/content-view'],
function (jasmine, jasminejquery, $, ListView, Content, ContentView) {
    'use strict';

    describe('A ContentListView', function () {
        var fixtureId = 'sandbox',
            listView,
            el,
            $el;

        beforeEach(function () {
            listView = new ListView({});
        });

        describe("when constructed", function () {

            it("is instanceof ListView", function () {
                expect(listView instanceof ListView).toBe(true);
            });

            it("is .writable", function () {
                expect(listView.writable).toBe(true);
                expect(listView.write).toEqual(jasmine.any(Function));
            });

            it("has a .$listEl", function () {
                expect(listView.$listEl.length).toBe(1);
            });

            it("has a .showMoreButton", function () {
                expect(listView.showMoreButton).toBeDefined();
            });

            describe("with opts.el", function () {

                beforeEach(function () {
                    setFixtures(sandbox());
                    $el = $('#'+fixtureId);
                    el = $el[0];

                    listView = new ListView({
                        el: el
                    });
                });

                it ("should have .el set to opts.el", function () {
                    expect(listView.el).toBe(el);
                });
            });
        });

        describe('.setElement', function () {
            var newElement;
            beforeEach(function () {
                newElement = document.createElement('div');
            });

            it('adds class .streamhub-list-view', function () {
                listView.setElement(newElement);
                expect($(newElement)).toHaveClass('streamhub-content-list-view');
            });
        });

        describe('handles focusContent.hub event', function () {

            var content;

            beforeEach(function() {
                listView = new ListView();

                content = new Content();
                listView.add(content);
            });

            it('shows the modal when a modal is set on the ListView instance', function () {
                spyOn(listView.modal, '_setFocus');
                spyOn(listView.modal, 'show');

                listView.$el.trigger('focusContent.hub', { content: content });

                expect(listView.modal.show).toHaveBeenCalled();
            });

            it('shows finds the correct ContentView instance and invokes .attachmentsView.focus when no modal is set on the ListView instance', function () {
                listView.modal = false;
                var targetContentView = listView.getContentView(content);
                targetContentView.attachmentsView.focus = function () {};
                spyOn(targetContentView.attachmentsView, 'focus');

                listView.$el.trigger('focusContent.hub', { content: content });

                expect(targetContentView.attachmentsView.focus).toHaveBeenCalled();
            });
        });

        describe("when constructed with opts.initial", function () {
            var initial,
                listView;
            beforeEach(function () {
                initial = 2;
                listView = new ListView({
                    initial: initial
                });
            });
            it(".add still always adds ContentViews", function () {
                var content1 = new Content('1'),
                    content2 = new Content('2'),
                    content3 = new Content('3');
                listView.add(content1);
                listView.add(content2);
                listView.add(content3);
                expect(listView.views.length).toBe(3);
            });
            it(".writing one more than initial results in only initial contentViews", function () {
                var origInitial = initial;
                while (--initial) {
                    listView.write(new Content(initial.toString()));
                }
                listView.write(new Content(initial.toString()));
                expect(listView.views.length).toBe(origInitial);
            });
            it(".showMore() can be called, and sets .more's goal", function () {
                var numToAdd = 5;
                listView.showMore(numToAdd);
                expect(listView.more.getGoal()).toBe(numToAdd);
            });
            describe("and a ton of Content is written to .more", function () {
                var toAdd,
                    remaining;
                beforeEach(function () {
                    toAdd = 50;
                    remaining = toAdd;
                    spyOn(listView, '_write').andCallThrough();
                    while (remaining--) {
                        listView.more.write(new Content(remaining.toString()));
                    }
                });
                it("only results in initial # of contentViews", function () {
                    // ContentViews may not be created until nextTick
                    waits(1);
                    runs(function () {
                        expect(listView.views.length).toBe(initial);
                    });
                });
            });
        });

        describe("opts.showMore", function () {
            var showMore,
                listView;
            beforeEach(function () {
                showMore = 39;
                listView = new ListView({
                    showMore: showMore
                });
            });
            it("uses opts.showMore when .showMore() is passed no argument", function () {
                spyOn(listView.more, 'setGoal');
                listView.showMore();
                expect(listView.more.setGoal).toHaveBeenCalledWith(showMore);
            });
            it("defaults to 50", function () {
                listView = new ListView();
                spyOn(listView.more, 'setGoal');
                listView.showMore();
                expect(listView.more.setGoal).toHaveBeenCalledWith(50);
            });
        });

        describe(".showMore()", function () {
            it("is called on showMore.hub event", function () {
                spyOn(listView, 'showMore').andCallThrough();
                listView.$el.trigger('showMore.hub');
                expect(listView.showMore).toHaveBeenCalledWith();
            });
            it("is called when .showMoreButton.$el is clicked", function () {
                spyOn(listView, 'showMore').andCallThrough();
                listView.showMoreButton.$el.click();
                expect(listView.showMore).toHaveBeenCalledWith();
            });
        });

        describe('handles removeContentView.hub event', function() {

            it('calls the .remove method', function() {
                var content = new Content();
                listView.add(content);
                spyOn(listView, 'remove');
                listView.$el.trigger('removeContentView.hub', content);
                expect(listView.remove).toHaveBeenCalled();
            });
        });

        describe("when the default comparator is passed ContentViews a, b", function () {
            var baseDate = new Date(),
                earlierDate = new Date(),
                laterDate = new Date();

            earlierDate.setFullYear(2012);
            baseDate.setFullYear(2013);
            laterDate.setFullYear(2014);

            describe("and a, b both have .content.createdAt", function () {
                var earlyContent = new Content({ body: 'early' }),
                    lateContent = new Content({ body: 'later' }),
                    earlyContentView = new ContentView({ content: earlyContent }),
                    lateContentView = new ContentView({ content: lateContent });

                earlyContent.createdAt = earlierDate;
                lateContent.createdAt = laterDate;

                it("returns < 0 if a.content was created after b.content", function () {
                    expect(listView.comparator(lateContentView, earlyContentView)).toBeLessThan(0);
                });
                it("returns > 0 if a.content was created before b.content", function () {
                    expect(listView.comparator(earlyContentView, lateContentView)).toBeGreaterThan(0);
                });
                it("returns 0 if a.content was created at the same time as b.content", function () {
                    expect(listView.comparator(earlyContentView, earlyContentView)).toBe(0);
                });
            });

            describe("and neither a nor b have .content.createdAt", function () {
                var a = new ContentView({ content: new Content('early') }),
                    b = new ContentView({ content: new Content('late') });
                it("returns < 0 if a was created after b", function () {
                    a.createdAt = laterDate;
                    b.createdAt = earlierDate;
                    expect(listView.comparator(a, b)).toBeLessThan(0);
                });
                it("returns > 0 if a was created before b", function () {
                    a.createdAt = earlierDate;
                    b.createdAt = laterDate;
                    expect(listView.comparator(a, b)).toBeGreaterThan(0);
                });
            });

            describe("and a.content has no .createdAt and b.content does", function () {
                var b = new ContentView({ content: new Content('b') });
                b.content.createdAt = baseDate;

                var a = new ContentView({ content: new Content('a') });

                // Comparing custom content to bootstrap Content, custom first
                it("returns < 0 if a.createdAt is after b.content.createdAt", function () {
                    a.createdAt = laterDate;
                    expect(listView.comparator(a, b)).toBeLessThan(0);
                });
                // Comparing custom content to new streaming content, new content first
                it("returns > 0 if a.createdAt is before b.content.createdAt", function () {
                    a.createdAt = earlierDate;
                    expect(listView.comparator(a, b)).toBeGreaterThan(0);
                });
            });

            describe("and b.content has no .createdAt and a.content does", function () {
                var a = new ContentView({ content: new Content('a') });
                a.content.createdAt = baseDate;

                var b = new ContentView({ content: new Content('b') });

                // Comparing new stream content to custom content, stream first
                it("returns < 0 if a.content.createdAt is after b.createdAt", function () {
                    b.createdAt = earlierDate;
                    expect(listView.comparator(a, b)).toBeLessThan(0);
                });
                // Comparing old bootstrap content to custom content, custom first
                it("returns > 0 if a.content.createdAt is before b.createdAt", function () {
                    b.createdAt = laterDate;
                    expect(listView.comparator(a, b)).toBeGreaterThan(0);
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
                    el: el
                });

                spyOn(listView, 'createContentView').andCallThrough();

                content = new Content({
                    content: 'Say what'
                });
                newContentView = listView.add(content);
            });

            it("returns the new ContentView", function () {
                expect(newContentView instanceof ContentView).toBe(true);
            });

            describe("and ContentViews are created", function () {
                it("stores them in .contentViews", function () {
                    expect(listView.views.length).toBe(1);
                    expect(listView.views[0] instanceof ContentView).toBe(true);
                });

                it("uses .createContentView(content) to create the ContentViews", function () {
                    expect(listView.createContentView.callCount).toBe(1);
                    expect(listView.createContentView.mostRecentCall.args[0]).toBe(content);
                });

                it("is returned later by .getExistingContentView", function () {
                    content.id = '11';
                    var contentView = listView.getContentView(content);
                    expect(contentView).toBeDefined();
                    expect(contentView.content).toBe(content);
                });
            });

            describe("and a ContentView is inserted", function () {
                it("the new ContentView is in the DOM", function () {
                    expect(listView.$listEl).toContain($(newContentView.el));
                });
            });
        });
    });

    describe("Default ListView.prototype.contentView", function () {
        var contentView;

        beforeEach(function () {
            contentView = new ContentView('');
        });

        describe("when constructed", function () {
            it ("uses a <article> tag for .el", function () {
                expect(contentView.el).toBe('article');
            });
        });
    });
});
