define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/collection/clients/bootstrap-client',
    'streamhub-sdk-tests/mocks/collection/clients/mock-bootstrap-client'],
function ($, LivefyreBootstrapClient, MockBootstrapClient) {
    'use strict';

    describe('A LivefyreBootstrapClient', function () {
        var mockData, callback, opts, bootstrapClient;

        beforeEach(function () {
            bootstrapClient = new LivefyreBootstrapClient();
        });
        
        describe("when constructed with normal opts", function () {
            beforeEach(function() {
                mockData = {"collectionSettings": {"networkId": "labs-t402.fyre.co", "archiveInfo": {"nPages": 5, "pageInfo": {"1": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/1.json", "last": 1359851209, "first": 1359839728}, "0": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/0.json", "last": 1359839709, "first": 1359668916}, "3": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/3.json", "last": 1359853588, "first": 1359852338}, "2": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/2.json", "last": 1359852289, "first": 1359851232}, "4": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/4.json", "last": 1360283812, "first": 1359853608}}, "pathBase": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/"}, "allowEditComments": false, "collectionId": "10669131", "url": "", "checksum": "", "bootstrapUrl": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/head.json", "title": "", "numVisible": 248, "nestLevel": 0, "siteId": "303827", "commentsDisabled": false, "allowGuestComments": false, "followers": 2, "config": {"nestLevel": 4, "__modified__": 1360628410.86003}, "data": [], "event": 1360628346051952, "editCommentInterval": 0}};

                spyOn(bootstrapClient, '_request').andCallFake(function (opts, errback) {
                    return $.ajax().success(function () {
                        errback(null, mockData);
                    });
                });
                
                callback = jasmine.createSpy();
                opts = {
                    "network": "labs-t402.fyre.co",
                    "siteId": "303827",
                    "articleId": "gene_publish_0",
                    "environment": "t402.livefyre.com"
                };
            });

            it("is instanceof LivefyreBootstrapClient", function () {
                expect(bootstrapClient instanceof LivefyreBootstrapClient).toBe(true);
            });

            it ("should return data when getContent is called", function () {
                bootstrapClient.getContent(opts, callback);
        
                waitsFor(function() {
                    return callback.callCount > 0;
                });
                runs(function() {
                    expect(callback).toHaveBeenCalled();
                    expect(callback.callCount).toBe(1);
                    expect(callback.mostRecentCall.args[0]).toBeNull();
                    expect(callback.mostRecentCall.args[1]).toBeDefined();
                    expect(callback.mostRecentCall.args[1]).toBe(mockData);
                });
            });

            it("requests page 0 when opts.page === 0", function () {
                opts.page = 0;
                bootstrapClient.getContent(opts, callback);
                waitsFor(function() {
                    return callback.callCount;
                }, '.getContent to respond');
                runs(function () {
                    var mostRecentRequest = bootstrapClient._request.mostRecentCall.args[0];
                    expect(mostRecentRequest.url).toMatch(/0\.json$/);
                });
            });

            it("requests correct URL when opts.environment is undefined", function () {
                var opts = {
                    network: "playstation.fyre.co",
                    siteId: "342776",
                    articleId: "custom-1378951411840"
                };
                bootstrapClient.getContent(opts, callback);
                waitsFor(function() {
                    return callback.callCount;
                }, '.getContent to respond');
                runs(function () {
                    var mostRecentRequest = bootstrapClient._request.mostRecentCall.args[0];
                    expect(mostRecentRequest.url).toBe('http://bootstrap.playstation.fyre.co/bs3/playstation.fyre.co/342776/Y3VzdG9tLTEzNzg5NTE0MTE4NDA=/init');
                });
            });
        });

        describe("when configured with environment='fyre'", function () {
            var opts,
                callback;
            beforeEach(function () {
                opts = {
                    "network": "livefyre.com",
                    "siteId": "286472",
                    "articleId": "509388c0-a272-4170-98b9-714973b37538",
                    "environment": "fyre"
                };
                callback = jasmine.createSpy();
                spyOn(bootstrapClient, '_request', function (opts, errback) {
                    return $.ajax().success(function () {
                        errback(null, {});
                    });
                });
            });
            it("requests the correct bootstrap URL for localdev", function () {
                bootstrapClient.getContent(opts, callback);
                var requestedUrl = bootstrapClient._request.mostRecentCall.args[0].url;
                expect(requestedUrl).toBe('http://bootstrap.fyre/bs3/livefyre.com/286472/NTA5Mzg4YzAtYTI3Mi00MTcwLTk4YjktNzE0OTczYjM3NTM4/init');
            });
        });

        describe("when configured without opts.environment (prod)", function () {
            var opts,
                callback;
            beforeEach(function () {
                opts = {
                    "network": "livefyre.com",
                    "siteId": "313878",
                    "articleId": "1"
                };
                callback = jasmine.createSpy();
                spyOn(bootstrapClient, '_request', function (opts, errback) {
                    return $.ajax().success(function () {
                        errback(null, {});
                    });
                });
            });
            it("requests the correct bootstrap URL for prod", function () {
                bootstrapClient.getContent(opts, callback);
                var requestedUrl = bootstrapClient._request.mostRecentCall.args[0].url;
                expect(requestedUrl).toBe('http://bootstrap.livefyre.com/bs3/livefyre.com/313878/MQ==/init');
            });
        });

        describe('when configured with opts.protocol=https', function () {
            var bootstrapClient;
            beforeEach(function () {
                bootstrapClient = new LivefyreBootstrapClient({
                    protocol: 'https'
                });
            });
            it('makes request to different URL using https and jsonp', function () {
                spyOn(bootstrapClient, '_request');
                bootstrapClient.getContent({
                    network: 'backplane-qa.fyre.co',
                    siteId: '290598',
                    articleId: '1',
                    environment: 'qa-ext.livefyre.com'
                });
                var ajaxArgs = bootstrapClient._request.mostRecentCall.args[0];
                expect(ajaxArgs.url).toBe('https://backplane-qa.bootstrap.fyre.co/bs3/backplane-qa.fyre.co/290598/MQ==/init');
            });
            it('makes correct request when opts.environment=fyre', function () {
                spyOn(bootstrapClient, '_request');
                bootstrapClient.getContent({
                    network: 'backplane-qa.fyre.co',
                    siteId: '290598',
                    articleId: '1',
                    environment: 'fyre'
                });
                var ajaxArgs = bootstrapClient._request.mostRecentCall.args[0];
                expect(ajaxArgs.url.indexOf('https')).toBe(0);
            });

        });
    });

    describe('streamhub-sdk-tests/mocks/collection/clients/mock-bootstrap-client', function () {
        it('returns featured content in init when constructed with opts.featuredInit', function () {
            var mockBootstrapClient = new MockBootstrapClient({
                featuredInit: true
            });
            var spy = jasmine.createSpy('on bootstrap init response');
            mockBootstrapClient.getContent({}, spy);
            expect(spy).toHaveBeenCalledWith(null, jasmine.any(Object));
            var featured = spy.mostRecentCall.args[1].featured;
            expect(featured.authors).toEqual(jasmine.any(Object));
            expect(featured.content).toEqual(jasmine.any(Array));
            expect(typeof featured.isComplete === 'boolean').toBe(true);
            expect(featured.size).toEqual(jasmine.any(Number));
        });

        it('returns a suitable response when page is featured-all', function () {
            var mockBootstrapClient = new MockBootstrapClient();
            var spy = jasmine.createSpy('on featured-all response');
            mockBootstrapClient.getContent({
                page: 'featured-all'
            }, spy);
            expect(spy).toHaveBeenCalledWith(null, jasmine.any(Object));
        });
    });

});