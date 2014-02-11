define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/views/list-view',
    'streamhub-sdk/view'],
function ($, ListView, View) {
    'use strict';

    describe('ListView', function () {
        describe('when constructed', function () {
            var list;
            beforeEach(function () {
                sandbox();
                list = new ListView({el: $('#sandbox')[0]});
            });
            
            afterEach(function () {
                list.destroy();
                list = null;
            });

            it('it calls #render() in the constructor', function () {
                spyOn(ListView.prototype, 'render').andCallThrough();
                list = new ListView({el: $('#sandbox')[0]});
                expect(ListView.prototype.render).toHaveBeenCalled();
            });
            
            describe('with opts', function () {
                var opts;
                beforeEach(function () {
                    opts = {
                            el: $('#sandbox')[0],
                            comparator: function () { return 1; }
                    };
                    list = new ListView(opts);
                });
                
                it('assigns opts.comparator to this.comparator', function () {
                    expect(list.comparator).toBe(opts.comparator);
                });

                it('does not call #render when opts.autoRender == false', function () {
                    list.destroy();
                    spyOn(ListView.prototype, 'render').andCallThrough();
                    opts.autoRender = false;
                    list = new ListView(opts);
                    expect(ListView.prototype.render).not.toHaveBeenCalled();
                });
            });
            
            describe('and adding views', function () {
                var view1,
                    view2,
                    view3,
                    addViews;
                beforeEach(function () {
                    view1 = new View();
                    view1.order = 1;
                    view2 = new View();
                    view2.order = 2;
                    view3 = new View();
                    view3.order = 3;
                    
                    addViews = function () {
                        list.add(view2);
                        list.add(view1);
                        list.add(view3);
                    };
                });
                
                it("removes content on 'removeView.hub'", function () {
                    list.add(view1);
                    expect(list.views.length).toBe(1);
                    expect(list.$listEl[0].children.length).toBe(1);
                    
                    view1.$el.trigger('removeView.hub', view1);
                    
                    expect(list.views.length).toBe(0);
                    expect(list.$listEl[0].children.length).toBe(0);
                });
                
                describe('without a comparator set', function () {
                    it('lists them as received', function () {
                        addViews();
                        
                        expect(list.views[0]).toBe(view2);
                        expect(list.views[1]).toBe(view1);
                        expect(list.views[2]).toBe(view3);
                    });
                });
                
                describe('with a comparator set', function () {
                    beforeEach(function () {
                        list.comparator = function (a, b) {
                            return a.order - b.order;
                        };
                    });
                    
                    it('orders them by the comparator', function () {
                        addViews();
                        
                        expect(list.views[0]).toBe(view1);
                        expect(list.views[1]).toBe(view2);
                        expect(list.views[2]).toBe(view3);
                    });
                    
                    describe('and a forcedIndex', function () {
                        var view4,
                            index,
                            origLength;
                        beforeEach(function () {
                            addViews();
                            view4 = new View();
                            index = 2;
                            origLength = list.views.length;
                            
                            list.add(view4, index);
                        });
                        
                        it('bypasses the comparator and add()s the view at the index', function () {
                            expect(list.views.length).toBe(origLength+1);
                            expect(list.views[index]).toBe(view4);
                        });
                        
                        it('registers a forcedIndex view as an _isIndexedView()', function () {
                            expect(list._isIndexedView(view4)).toBeTruthy();
                        });
                    });
                });
            });
        });
    });
});
