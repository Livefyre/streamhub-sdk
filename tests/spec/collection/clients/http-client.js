define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/collection/clients/http-client'],
function ($, HttpClient) {
    'use strict';

    describe('An HttpClient', function() {
        var client;

        beforeEach(function() {
            client = new HttpClient({ serviceName: 'admin' });
        });

        describe('_getHost', function() {
            it('should handle livefyre.com network properly', function() {
                var host = client._getHost({ network: 'livefyre.com' });
                expect(host).toBe('admin.livefyre.com');
            });

            it('should handle environments properly', function() {
                var host = client._getHost({ network: 'livefyre.com', environment: 'qa-ext.livefyre.com' });
                expect(host).toBe('admin.qa-ext.livefyre.com');
                host = client._getHost({ network: 'livefyre.com', environment: 't402.livefyre.com' });
                expect(host).toBe('admin.t402.livefyre.com');
            });

            it('should handle custom networks with an environment properly', function() {
                var host = client._getHost({ network: 'test.fyre.co', environment: 'qa-ext.livefyre.com' });
                expect(host).toBe('admin.test.fyre.co');
            });

            it('should not change the host for livefyre.com if https', function() {
                client._protocol = 'https:';
                var host = client._getHost({ network: 'livefyre.com' });
                expect(host).toBe('admin.livefyre.com');
            });

            it('should change the host for custom networks if https', function() {
                client._protocol = 'https:';
                var host = client._getHost({ network: 'test.fyre.co' });
                expect(host).toBe('test.admin.fyre.co');
            });
        });

        describe('_request', function() {
            it('support overriding contentType', function() {
                spyOn($, 'ajax').andReturn({
                    done: function() {},
                    fail: function() {}
                });
                client._request({contentType: 'something'});
                expect($.ajax.calls.length).toBe(1);
                expect($.ajax.calls[0].args[0].contentType).toBe('something');
            });
        });
    });
});
