define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/view'],
function ($, View) {
    'use strict';

    describe('streamhub-sdk/view', function () {
        var view;
        beforeEach(function () {
            view = new View();
        });
        describe('.setElement(element)', function () {
            it('sets .el and $el when passed an HTMLElement', function () {
                var element = document.createElement('div');
                view.setElement(element);
                expect(view.el).toEqual(element);
                expect(view.$el instanceof $).toBe(true);
                expect(view.$el[0]).toEqual(element);
            });
            it('sets .el and $el when passed an jQuery Element', function () {
                var element = document.createElement('div'),
                    $element = $(element);
                view.setElement($element);
                expect(view.el).toEqual(element);
                expect(view.$el instanceof $).toBe(true);
                expect(view.$el[0]).toEqual(element);
            });
        });
        describe('$', function () {
            it('queries the local Element', function () {
                view.setElement('<div><test>test</test></div>');
                expect(view.$('test').html()).toEqual('test');
            });
        });
        describe('.delegateEvents()', function () {
            it('understands method names as callbacks', function () {
                view.setElement('<div><test>test</test></div>');
                view.truth = false;
                view.setTruth = function() { this.truth = true; };
                var events = { 'click.hub test': 'setTruth' };

                view.delegateEvents(events);
                view.$('test').trigger('click.hub');

                expect(view.truth).toBe(true);
            });
            it('understands functions as callbacks', function () {
                view.setElement('<div><test>test</test></div>');
                view.truth = false;
                var events = {
                    'click test': function () {
                        view.truth = true;
                    }
                };

                view.delegateEvents(events);
                view.$('test').trigger('click');

                expect(view.truth).toBe(true);
            });
        });
        describe('.undelegateEvents()', function () {
            it('can take out the trash', function() {
                view.setElement('<div><test>test</test></div>');
                view.truth = false;
                var events = {
                    'click test': function () {
                        view.truth = true;
                    }
                };

                view.delegateEvents(events);
                view.undelegateEvents();
                view.$('test').trigger('click.hub');

                expect(view.truth).toBe(false);
            });
            it('can take out the trash for namespaced events', function() {
                view.setElement('<div><test>test</test></div>');
                view.truth = false;
                var events = {
                    'click.hub test': function () {
                        view.truth = true;
                    }
                };

                view.delegateEvents(events);
                view.undelegateEvents();
                view.$('test').trigger('click.hub');

                expect(view.truth).toBe(false);
            });
        });
    });
});
