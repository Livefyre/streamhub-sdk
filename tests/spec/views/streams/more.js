define([
    'jasmine',
    'streamhub-sdk/views/streams/more'],
function (jasmine, More) {
    'use strict';

    describe('streamhub-sdk/views/streams/more', function () {
        it('is a function', function () {
            expect(More).toEqual(jasmine.any(Function));
        });
        describe('when constructed', function () {
            var more;
            beforeEach(function () {
                more = new More();
            });
            it('goal defaults to 0', function () {
                expect(more.getGoal()).toBe(0);
                more.write(1);
                expect(more.read()).toBe(null);
            });
            describe('.setGoal(newGoal)', function () {

            });
        });
        describe('when constructed with an opts.goal', function () {
            var more,
                goal;
            beforeEach(function () {
                goal = 5;
                more = new More({
                    goal: goal
                });
            });
            it('.getGoal() returns goal', function () {
                expect(more.getGoal()).toBe(goal);
            });
            it('will read out the first items upto goal, but no more', function () {
                var writeGoal = goal + 5,
                    readGoal = goal;
                // Write goal times, and then some
                while (writeGoal--) {
                    more.write(writeGoal);
                }
                // Read goal times, each time should return something
                while (readGoal--) {
                    expect(more.read()).not.toBe(null);
                }
                // Then it should return null
                expect(more.read()).toBe(null);
            });
        });

        it('emits hold when content is written but goal is reached', function () {
            var more = new More({
                    goal: 1
                }),
                onHold = jasmine.createSpy('onHold');
            more.on('hold', onHold);
            expect(onHold).not.toHaveBeenCalled();
            more.write(1);
            more.read();
            expect(onHold).not.toHaveBeenCalled();
            more.write(2);
            more.read();
            expect(onHold).toHaveBeenCalled();
        });

        describe('.stash', function () {
            var more;
            beforeEach(function () {
                more = new More({
                    goal: 10
                });
            });
            it('stashed stuff returns last-in-last-out from .read()', function () {
                var stuff = [];
                more.stash(3);
                more.stash(4);
                expect(more.read()).toBe(4);
                expect(more.read()).toBe(3);
            });
            it('does not cause a readable event', function () {
                var onReadableSpy = jasmine.createSpy('onReadable');
                more.on('readable', onReadableSpy);
                more.stash(1);
                expect(onReadableSpy).not.toHaveBeenCalled();
            });
            it('works with data events', function () {
                var things = [];
                more.write(1);
                more.write(2);
                more.stash('s1');
                more.stash('s2');
                more.on('data', function (d) {
                    things.push(d);
                });
                waitsFor(function () {
                    return things.length === 4;
                });
                runs(function () {
                    expect(things.length).toBe(4);
                    expect(things[0]).toBe('s2');
                    expect(things[1]).toBe('s1');
                    expect(things[2]).toBe(1);
                    expect(things[3]).toBe(2);
                });
            });
        });
    });
});