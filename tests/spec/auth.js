define([
    'jasmine',
    'streamhub-sdk/auth',
    'event-emitter'],
function (jasmine, Auth, EventEmitter) {
    describe('streamhub-sdk/auth', function () {
        afterEach(function () {
            Auth.setToken();
        });
        it('is an object', function () {
            expect(Auth).toEqual(jasmine.any(Object));
        });
        it('is an EventEmitter', function () {
            expect(Auth instanceof EventEmitter).toBe(true);
        });
        describe('.setToken(token)', function () {
            it('stores the token', function () {
                var token = '123';
                Auth.setToken(token);
                expect(Auth._token).toBe(token);
            });
            it('emits a token event', function () {
                var token = 'token',
                    onToken = jasmine.createSpy('onToken');
                Auth.on('token', onToken);
                Auth.setToken(token);
                expect(onToken).toHaveBeenCalledWith(token);
            });
        });
        describe('.getToken()', function () {
            it('returns undefined if no token has been set', function () {
                expect(Auth.getToken()).toBe(undefined);
            });
            it('returns a token if one has been set', function () {
                var token1 = '12345',
                    token2 = 'abcdef';
                Auth.setToken(token1);
                expect(Auth.getToken()).toBe(token1);
                Auth.setToken(token2);
                expect(Auth.getToken()).toBe(token2);
            });
        });
    });
});
