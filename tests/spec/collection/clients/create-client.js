define([
    'streamhub-sdk/jquery',
    'jasmine',
    'streamhub-sdk/collection/clients/create-client',
    'jasmine-jquery'],
function ($, jasmine, LivefyreCreateClient) {
    'use strict';

    describe('A LivefyreCreateClient', function () {
        var spy, mockSuccessResponse, callback, opts, createClient;

        beforeEach(function () {
            createClient = new LivefyreCreateClient();
        });
        
        describe("when constructed with normal opts", function () {
            beforeEach(function() {
                mockSuccessResponse = {"msg": "This request is being processed.", "status": "ok", "code": 202};

                spy = spyOn($, "ajax").andCallFake(function(opts) {
                    opts.success(mockSuccessResponse);
                });
                
                callback = jasmine.createSpy();
                opts = {"environment": "t402.livefyre.com",
                        "network": "labs-t402.fyre.co",
                        "siteId": "286470",
                        "articleId": "1111123",
                        "collectionMeta": {
                            "title": 'Media Wall Example',
                            "url": 'http://www.fake.com',
                            "tags": ['test', 'wall']
                        },
                        "signed": false
                };
            });

            it("is instanceof LivefyreCreateClient", function () {
                expect(createClient instanceof LivefyreCreateClient).toBe(true);
            });

            it("should return a confirmation when createCollection is called", function () {        
                createClient.createCollection(opts, callback);
        
                waitsFor(function() {
                    return callback.callCount > 0;
                });
                runs(function() {
                    expect(callback).toHaveBeenCalled();
                    expect(callback.callCount).toBe(1);
                    expect(callback.mostRecentCall.args[0]).toBeNull();
                    expect(callback.mostRecentCall.args[1]).toBeDefined();
                    expect(callback.mostRecentCall.args[1]).toBe(mockSuccessResponse);
                });                            
            });
            
            it("has the correct post data", function () {
                createClient.createCollection(opts, callback);
                var requestType = $.ajax.mostRecentCall.args[0].type;
                var requestData = $.ajax.mostRecentCall.args[0].data;
                expect(requestType).toBe('POST');
                expect(requestData).toBe('{"collectionMeta":{"title":"Media Wall Example","url":"http://www.fake.com","tags":"test,wall","articleId":"1111123"},"signed":false}');
            });
            
            it("requests the correct URL", function () {
                createClient.createCollection(opts, callback);
                var requestUrl = $.ajax.mostRecentCall.args[0].url;
                expect(requestUrl).toBe('http://quill.labs-t402.fyre.co/api/v3.0/site/286470/collection/create');
            });
        });
        
        describe("when constructed with a token", function () {
            beforeEach(function() {
                spy = spyOn($, "ajax").andCallFake(function(opts) {
                    return;
                });
                
                opts = {"environment": "t402.livefyre.com",
                        "network": "labs-t402.fyre.co",
                        "siteId": "286470",
                        "articleId": "1111123",
                        "collectionMeta": "tokenstring",
                        "signed": true,
                        "checksum": "check"
                };
            });

            it("has the correct post data", function () {
                createClient.createCollection(opts, callback);
                var requestType = $.ajax.mostRecentCall.args[0].type;
                var requestData = $.ajax.mostRecentCall.args[0].data;
                expect(requestType).toBe('POST');
                expect(requestData).toBe('{"collectionMeta":"tokenstring","signed":true,"checksum":"check"}');
            });
            
        });
        
        describe("when configured with environment='fyre'", function () {
            var opts, callback;
            beforeEach(function () {
                opts = {"environment": "fyre",
                        "network": "fyre",
                        "siteId": "286470",
                        "articleId": "1111123",
                        "collectionMeta": {
                            "title": 'Media Wall Example',
                            "url": 'http://www.fake.com',
                            "tags": ['test', 'wall']
                        },
                        "signed": false
                };
                callback = jasmine.createSpy();
                spyOn($, 'ajax').andCallFake(function (opts) {
                    opts.success({});
                });
            });
            
            it("requests the correct create collection URL for localdev", function () {
                createClient.createCollection(opts, callback);
                var requestedUrl = $.ajax.mostRecentCall.args[0].url;
                expect(requestedUrl).toBe('http://quill.fyre/api/v3.0/site/286470/collection/create');
            });
        });
    }); 
});