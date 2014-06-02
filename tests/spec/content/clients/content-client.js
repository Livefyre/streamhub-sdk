var $ = require('streamhub-sdk/jquery');
var LivefyreContentClient = require('streamhub-sdk/content/clients/content-client');

'use strict';

describe('streamhub-sdk/content/clients/content-client', function () {
    var spy,
        mockResponse,
        callback,
        callOpts,
        contentClient,
        collectionId,
        contentId,
        environment,
        network;
    beforeEach(function() {
        mockResponse = {
        //From http://bootstrap.t402.livefyre.com/api/v3.0/content/thread/?collection_id=10772933&content_id=26482715&depth_only=false
            "status": "ok",
            "code": 200,
            "data": {
                "content": [{
                    "source": 0,
                    "collectionId": "10772933",
                    "content": {
                        "parentId": "",
                        "bodyHtml": "<p> so awesome</p>",
                        "annotations": {
                            "likedBy": ["_up4730101@livefyre.com"]
                        },
                        "authorId": "_up10268272@livefyre.com",
                        "updatedAt": 1387412552,
                        "id": "26482714",
                        "createdAt": 1387412551
                    },
                    "vis": 1,
                    "type": 0,
                    "event": 1387412562279175
                }, {
                    "source": 5,
                    "collectionId": "10772933",
                    "content": {
                        "parentId": "26482714",
                        "bodyHtml": "<p><a vocab=\"http://schema.org\" typeof=\"Person\" rel=\"nofollow\" resource=\"acct:_up10268272@livefyre.com\" data-lf-handle=\"\" data-lf-provider=\"livefyre\" property=\"url\" href=\"http://www.t402.livefyre.com/profile/10268272/\" target=\"_blank\" class=\"fyre-mention fyre-mention-livefyre\">@<span property=\"name\">terdy</span></a>\u00a0it so, is..\u00a0</p>",
                        "annotations": {},
                        "authorId": "_up4730101@livefyre.com",
                        "createdAt": 1387412573,
                        "updatedAt": 1387412573,
                        "id": "26482715",
                        "ancestorId": "26482714"
                    },
                    "vis": 1,
                    "type": 0,
                    "event": 1387412573233476
                }],
                "meta": {
                    "page": 92
                },
                "authors": {
                    "_up4730101@livefyre.com": {
                        "displayName": "ordinaryJ0e",
                        "tags": ["Funny"],
                        "profileUrl": "http://www.t402.livefyre.com/profile/4730101/",
                        "avatar": "http://gravatar.com/avatar/29af9adcb70063240b48d5c79164d95d/?s=50&d=http://avatars-staging.fyre.co/a/anon/50.jpg",
                        "type": 1,
                        "id": "_up4730101@livefyre.com"
                    },
                    "_up10268272@livefyre.com": {
                        "displayName": "terdy",
                        "tags": ["d[-_-]b", "Funny", "omg"],
                        "profileUrl": "http://www.t402.livefyre.com/profile/10268272/",
                        "avatar": "http://gravatar.com/avatar/3527efb0c251380396f90efe648eb76c/?s=50&d=http://avatars-staging.fyre.co/a/anon/50.jpg",
                        "type": 1,
                        "id": "_up10268272@livefyre.com"
                    }
                }
            }
        };
        collectionId = 10772933;
        contentId = 26482715;
        network = 't402.livefyre.com';
        environment = "t402.livefyre.com";
        contentClient = new LivefyreContentClient();

        spy = spyOn(contentClient, "_request").andCallFake(function(opts, errback) {
            return $.ajax().success(function () {
                errback(null, {"data": mockResponse});
            }).error(function () {
                errback("error msg");
            });
        });
        
        callback = jasmine.createSpy('callback');
        callOpts = {
            network: network,
//            environment: environment,
            collectionId: collectionId,
            contentId: contentId
        };
    });

    it("is a constructor", function () {
        expect(LivefyreContentClient).toEqual(jasmine.any(Function));
        expect(new LivefyreContentClient() instanceof LivefyreContentClient).toBe(true);
    });
    
    describe('when constructed', function () {
        it("makes requests to the right URL", function () {
            contentClient.getContent(callOpts, callback);
            expect(contentClient._request.mostRecentCall.args[0].url).toBe(
                ["http://bootstrap.",
                 network,
                 "/api/v3.0/content/thread/"//,
//                 "?collection_id=",
//                 collectionId,
//                 "&content_id=",
//                 contentId,
//                 "&depth_only=false"
                ].join(''));
        });
        
        xit('passes errors to the callback for getContent()', function () {
            callOpts.network = 'fake';
            callOpts.contentId = '2';
            contentClient.getContent(callOpts, callback).fail(null, null, 'error msg');
            
            waitsFor(function() {
                return callback.callCount > 0;
            }, 'the callback to get called', 1000);
            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(callback.callCount).toBe(1);
                expect(callback.mostRecentCall.args[0]).toBeDefined();
                expect(callback.mostRecentCall.args[0]).toBe("error msg");
            });
        });
        
        it('passes successful state data to the callback for getContent()', function () {
            contentClient.getContent(callOpts, callback).done(mockResponse);
            
            waitsFor(function() {
                return callback.callCount > 0;
            }, 'the callback to get called', 1000);
            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(callback.callCount).toBe(1);
                expect(callback.mostRecentCall.args[0]).toBeNull();
                expect(callback.mostRecentCall.args[1]).toBeDefined();
                expect(callback.mostRecentCall.args[1]).toBe(mockResponse);
            });
        });
    
        it("returns an object representing the request", function () {
            var req = contentClient.getContent(callOpts, callback);
            expect(req.abort).toEqual(jasmine.any(Function));
        });
        
        describe('with opts', function () {
            var contentClient, opts;
            beforeEach(function () {
                contentClient = new LivefyreContentClient({
                    protocol: 'https',
                    serviceName: 'test'
                });
                spyOn(contentClient, '_request');
            });
            
            it('makes requests to the right opts.protocol and opts.serviceName URL', function () {
                contentClient.getContent(callOpts, callback);
                expect(contentClient._request.mostRecentCall.args[0].url.match('https://t402.test.')).toBeTruthy();
            });
        });
        
        describe('and called with additional opts', function () {
            beforeEach(function () {
                callOpts.depthOnly = true;
            });
            
            it('makes a request with depth_only=true', function() {
                contentClient.getContent(callOpts, callback);
                expect(contentClient._request.mostRecentCall.args[0].data.depth_only).toBe(true);
            });
        });
    });
});
