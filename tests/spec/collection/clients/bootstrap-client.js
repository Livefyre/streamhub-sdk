define([
    'streamhub-sdk/jquery',
    'jasmine',
    'streamhub-sdk/collection/clients/bootstrap-client',
    'jasmine-jquery'],
function ($, jasmine, LivefyreBootstrapClient) {
    'use strict';

    describe('A LivefyreBootstrapClient', function () {
        var spy, mockData, callback, opts, bootstrapClient;

        beforeEach(function () {
            bootstrapClient = new LivefyreBootstrapClient();
        });
        
        describe("when constructed with normal opts", function () {
            beforeEach(function() {
                mockData = {"collectionSettings": {"networkId": "labs-t402.fyre.co", "archiveInfo": {"nPages": 5, "pageInfo": {"1": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/1.json", "last": 1359851209, "first": 1359839728}, "0": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/0.json", "last": 1359839709, "first": 1359668916}, "3": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/3.json", "last": 1359853588, "first": 1359852338}, "2": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/2.json", "last": 1359852289, "first": 1359851232}, "4": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/4.json", "last": 1360283812, "first": 1359853608}}, "pathBase": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/"}, "allowEditComments": false, "collectionId": "10669131", "url": "", "checksum": "", "bootstrapUrl": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/head.json", "title": "", "numVisible": 248, "nestLevel": 0, "siteId": "303827", "commentsDisabled": false, "allowGuestComments": false, "followers": 2, "config": {"nestLevel": 4, "__modified__": 1360628410.86003}, "data": [], "event": 1360628346051952, "editCommentInterval": 0}};

                spy = spyOn($, "ajax").andCallFake(function(opts) {
                    opts.success(mockData);
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
                    var mostRecentRequest = $.ajax.mostRecentCall.args[0];
                    expect(mostRecentRequest.url).toMatch(/0\.json$/);
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
                spyOn($, 'ajax').andCallFake(function (opts) {
                    opts.success({});
                });
            });
            it("requests the correct bootstrap URL for localdev", function () {
                bootstrapClient.getContent(opts, callback);
                var requestedUrl = $.ajax.mostRecentCall.args[0].url;
                expect(requestedUrl).toBe('http://bootstrap.fyre/bs3/livefyre.com/286472/NTA5Mzg4YzAtYTI3Mi00MTcwLTk4YjktNzE0OTczYjM3NTM4/init');
            });
        });
    }); 
});