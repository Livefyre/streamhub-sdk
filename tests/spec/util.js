define([
    'jquery',
    'jasmine',
    'streamhub-sdk/util'],
function ($, jasmine, Util) {
    'use strict';

    describe('streamhub-sdk/util', function () {
        describe('formatDate', function () {
            var relativeTo,
                createdAt;
            function addSeconds (numSeconds, relativeTo) {
                return new Date(relativeTo.getTime() + numSeconds * 1000);
            }
            function addMinutes (numMinutes, relativeTo) {
                return addSeconds(numMinutes * 60, relativeTo);
            }
            function addHours (numHours, relativeTo) {
                return addMinutes(numHours * 60, relativeTo);
            }
            function addDays (numDays, relativeTo) {
                return addHours(numDays * 24, relativeTo);
            }
            beforeEach(function () {
                // Thurs Aug 01 2013 00:01:01 GMT
                relativeTo = new Date();
                relativeTo.setFullYear(2013);
                relativeTo.setMonth(7);
                relativeTo.setDate(1);
                relativeTo.setHours(0);
                relativeTo.setMinutes(1);
                relativeTo.setSeconds(1);
            });
            it('renders empty string if content is from the future', function () {
                createdAt = addSeconds(1, relativeTo);
                expect(Util.formatDate(createdAt, relativeTo)).toBe('');
            });
            it('renders like 1s if content is from 1s ago', function () {
                createdAt = addSeconds(-1, relativeTo);
                expect(Util.formatDate(createdAt, relativeTo)).toBe('1s');
            });
            it('renders like 58s if content is from 58s ago', function () {
                createdAt = addSeconds(-58, relativeTo);
                expect(Util.formatDate(createdAt, relativeTo)).toBe('58s');
            });
            it('renders like 1m if content is from 1:01m ago', function () {
                createdAt = addSeconds(-61, relativeTo);
                expect(Util.formatDate(createdAt, relativeTo)).toBe('1m');
            });
            it('renders like 2m if content is from 1:31m ago', function () {
                createdAt = addMinutes(-1, addSeconds(-31, relativeTo));
                expect(Util.formatDate(createdAt, relativeTo)).toBe('2m');
            });
            it('renders like 30m if content is from 30:05m ago', function () {
                createdAt = addMinutes(-30, addSeconds(-5, relativeTo));
                expect(Util.formatDate(createdAt, relativeTo)).toBe('30m');
            });
            it('renders like 59m if content is from 59 minutes ago', function () {
                createdAt = addMinutes(-59, relativeTo);
                expect(Util.formatDate(createdAt, relativeTo)).toBe('59m');
            });
            it('renders like 1h if content is from 1 hour ago', function () {
                createdAt = addHours(-1, relativeTo);
                expect(Util.formatDate(createdAt, relativeTo)).toBe('1h');
            });
            it('renders like 2h if content is from 1h and 31m ago', function () {
                createdAt = addHours(-1, addMinutes(-31, relativeTo));
                expect(Util.formatDate(createdAt, relativeTo)).toBe('2h');
            });
            it('renders like 21h if content is from 20h and 31m ago', function () {
                createdAt = addHours(-20, addMinutes(-31, relativeTo));
                expect(Util.formatDate(createdAt, relativeTo)).toBe('21h');
            });
            it('renders like 21h if content is from 21h and 17m ago', function () {
                createdAt = addHours(-21, addMinutes(-17, relativeTo));
                expect(Util.formatDate(createdAt, relativeTo)).toBe('21h');
            });
            it('renders like 23h if content is from 23h and 22m ago', function () {
                createdAt = addHours(-23, addMinutes(-22, relativeTo));
                expect(Util.formatDate(createdAt, relativeTo)).toBe('23h');
            });
            // The following tests may fail on clients with different time zones
            it('renders like 24h if content is from 23h and 58m ago', function () {
                createdAt = addHours(-23, addMinutes(-58, relativeTo));
                expect(Util.formatDate(createdAt, relativeTo)).toBe('24h');
            });
            it('renders like Jun 6 if content is from 1d and 29m ago', function () {
                createdAt = addHours(-24, addMinutes(-29, relativeTo));
                expect(Util.formatDate(createdAt, relativeTo)).toBe('30 Jul');
            });
            it('renders like Dec 28 2012 if content is from < 1 year ago but a different year', function () {
                createdAt = addDays(-220, relativeTo);
                // The exact day will be different depending on the clients' timezone. So just check that the
                // month and year are there
                expect(Util.formatDate(createdAt, relativeTo).indexOf('Dec 2012')).not.toBe(-1);
            });
        });
    });
});