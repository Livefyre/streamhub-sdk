define([
    'streamhub-sdk/jquery',
    'jasmine',
    'streamhub-sdk/content/content',
    'jasmine-jquery'],
function ($, jasmine, Content) {
    'use strict';

    describe('Content', function () {
        it("can be constructed with just a string", function () {
            var body = 'what';
            var content = new Content(body);
            expect(content.body).toBe(body);
        });
        it("can be constructed with opts and opts.body", function () {
            var body = 'what';
            var content = new Content({
                body: body
            });
            expect(content.body).toBe(body);
        });
    });
});