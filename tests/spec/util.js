define([
    'jquery',
    'jasmine',
    'streamhub-sdk/util'],
function ($, jasmine, Util) {
    describe('Util.formatDate', function () {
        it('renders date objects to a string', function () {
            var formattedDate = Util.formatDate(new Date(1372192687*1000));
            expect(typeof formattedDate === 'string').toBe(true);
        });
    });
});