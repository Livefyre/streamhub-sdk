var config = require('streamhub-sdk/config');

describe('ConfigSvc', function () {
    describe('#get', function () {
        it('gets a value that exists', function () {
            config._config.abc = 'def';
            expect(config.get('abc')).toBe('def');
        });

        it('gets default value if key doesn\'t exist', function () {
            expect(config.get('def', 'ghi')).toBe('ghi');
            expect(config.get('def')).toBe(undefined);
        });
    });

    describe('#set', function () {
        it('sets a key/value pair when key is string', function () {
            config.set('xyz', 'abc');
            expect(config.get('xyz')).toBe('abc');
        });

        it('sets multiple key/value pairs when key is object', function () {
            config.set({'uvw': 'xyz'});
            expect(config.get('uvw')).toBe('xyz');
        });
    });
});
