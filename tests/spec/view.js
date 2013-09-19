define([
    'jasmine',
    'streamhub-sdk/jquery',
    'streamhub-sdk/view'],
function (jasmine, $, View) {
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
    });
});
