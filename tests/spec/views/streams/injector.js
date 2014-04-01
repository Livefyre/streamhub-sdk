define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/views/streams/injector',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-sdk/content',
    'streamhub-sdk-tests/mocks/mock-attachments-stream'],
function ($, Injector, ContentListView, Content, MockCollection) {
    'use strict';

    describe('Injector', function () {
        describe('when constructed', function () {
            var injector,
                source,
                target;
            beforeEach(function () {
                injector = new Injector();
                source = new MockCollection();
                target = new ContentListView();
            });
            
            afterEach(function () {
                target.destroy();
                injector = source = target = null;
            });
            
            describe('with opts', function () {
                var opts;
                beforeEach(function () {
                    opts = {
                            interval: 6,
                            count: 3,
                            target: target,
                            source: source
                    };
                    injector = new Injector(opts);
                });
                
                it('assigns opts.interval to this._interval', function () {
                    expect(injector._interval).toBe(opts.interval);
                });
                
                it('assigns opts.count to this.count', function () {
                    expect(injector.count).toBe(opts.count);
                });
                
                it('will target opts.target', function () {
                    expect(injector._target).toBe(opts.target);
                });
                
                it('pipes itself from opts.source', function () {
                    expect(opts.source._readableState.pipes).toContain(injector);
                });
            });
            
            it('can set target once with .target(ContentListView)', function () {
                expect(injector._target).toBeFalsy();
                
                injector.target(target);
                expect(injector._target).toBe(target);
                expect(setTwice).toThrow();
                
                function setTwice() {
                    injector.target(target);
                }
            });
            
            it('throws if .inject() is called before .target() is set', function () {
                function injectWithoutTarget () {
                    injector.inject();
                }
                expect(injectWithoutTarget).toThrow();
            });

            it('returns itself when .target(ContentListView)', function () {
                var retVal = injector.target(target);
                expect(retVal).toBe(injector);
            });
            
            it('can update the public property .count', function () {
                var origVal = injector.count;
                injector.count += 1;
                
                expect(injector.count).not.toBe(origVal);
            });
            
            it('can .setInterval() to >= 1', function () {
                var n = 1000;
                expect(injector._interval).not.toBe(n);
                
                injector.setInterval(n);
                expect(injector._interval).toBe(n);
            });
            
            it('can\'t setInterval() to any number <= 0', function () {
                var origVal = injector._interval;
                
                injector.setInterval(0);
                injector.setInterval(-1);
                expect(injector._interval).toBe(origVal);
            });
            
            it('initializes with ._counter = -1', function () {
                expect(injector._counter).toBe(-1);
            });
            
            it('returns _counter with .getCounter()', function () {
                expect(injector.getCounter()).toBe(injector._counter);
            });
            
            describe('with data piping from a source', function () {
                var content,
                    content2;
                beforeEach(function () {
                    source.pipe(injector);
                    content = new Content({ body: "Body text" });
                    content2 = new Content({ body: "Body text2" });
                });
                
                afterEach(function () {
                    source.unpipe(injector);
                    content = content2 = null;
                });
                
                it('can target() a specified ContentListView', function () {
                    injector.target(target);
                    expect(injector._target).toBe(target);
                });
                
                describe('and a target ContentListView ', function () {
                    beforeEach(function () {
                        injector.target(target);
                    });
                    
                    it('can untarget() its existing target', function () {
                        injector.untarget();
                        expect(injector._target).toBeFalsy();
                    });
                    
                    it('triggers an injection and resets the ._counter when .setInterval(n <= ._counter', function () {
                        spyOn(injector, 'now').andCallThrough();
                        
                        injector.setInterval(5);
                        expect(injector.now).not.toHaveBeenCalled();
                        expect(injector._counter).toBe(-1);
                        
                        injector._counter = 3;
                        injector.setInterval(2);
                        expect(injector.now).toHaveBeenCalled();
                        expect(injector._counter).toBe(0);
                    });
                    
                    it('triggers an injection, resets the ._counter, and returns this Injector when .now()', function () {
                        spyOn(injector, 'inject');
                        
                        var retVal = injector.now();
                        expect(injector.inject).toHaveBeenCalled();
                        expect(injector._counter).toBe(0);
                        expect(retVal).toBe(injector);
                    });
                    
                    it('injects n pieces of content at i index without reseting the counter when .inject(n, i)', function () {
                        var n = 2,
                            i = 1;
                        injector.setInterval(6);
                        
                        target.write(content);
                        target.write(content2);
                        expect(injector._counter).toBe(1);
                        
                        injector.inject(n, i);
                        
                        waitsFor(function () {
                            return target.views.length === 4;
                        }, 'target to contain 4 views', 300);
                        runs(function () {
                            var justInjections = target.views.slice(1, 3);
                            expect(target.views[3].content).toBe(content);
                            expect(justInjections).not.toContain(content);
                            expect(justInjections).not.toContain(content2);
                            expect(target.views[0].content).toBe(content2);
                        });
                    });
                    
                    it('monitors the ._target for "added" events and increments ._counter even if "view" isn\'t provided', function () {
                        var origCounter = injector._counter;
                        
                        target.emit('added');
                        expect(injector._counter).toBe(origCounter+1);
                    });
                    
                    it('automatically injects .count number of content when ._counter === interval and sets ._counter = 0', function () {
                        var count = injector.count = 5;
                        spyOn(target, "add").andCallThrough();
                        
                        //Hack-up the scenario
                        injector._counter = 2;
                        injector._interval = 3;
                        
                        target.write(content);
                        waitsFor(function () {
                            return target.add.calls.length === count + 1;//target.write() also calls add
                        }, 'target.add() to get called ' + (count + 1) + ' times', 300);
                        runs(function () {
                            expect(injector._counter).toBe(0);
                        });
                    });
                    
                    it('inject()s content into the ContentListView specifying the index of the item that triggered the injection and doesn\'t increment ._counter for its own injected content', function () {
                        spyOn(target, "add").andCallThrough();
                        
                        content.createdAt = new Date(2);
                        content2.createdAt = new Date(1);
                        
                        target.write(content);
                        target.write(content2);
                        //[content, content2]
                        
                        waitsFor(function () {
                            return target.views.length === 3;
                        }, 'target to contain 3 views', 300);
                        runs(function () {
                            //[content, injection, content2]
                            expect(target.views[0].content).toBe(content);
                            expect(target.views[2].content).toBe(content2);
                            expect(target.add.mostRecentCall.args[1]).toBe(1);
                            expect(injector._counter).toBe(0);
                        });
                    });
                });
            });
        });
    });
});
