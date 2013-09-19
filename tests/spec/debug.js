define(['jasmine', 'streamhub-sdk/debug'], function (jasmine, debug) {
    'use strict';

	describe('streamhub-sdk/debug', function () {
		it('is defined as a function', function () {
			expect(debug).toBeDefined();
			expect(debug).toEqual(jasmine.any(Function));
		});
		describe('when executed', function () {
			var log;
			beforeEach(function () {
				log = debug('logger name');
			});
			it('returns a function that doesnt throw', function () {
				expect(log).toEqual(jasmine.any(Function));
				expect(function () {
					log('my message');
				}).not.toThrow();
			});
		});
	});
});