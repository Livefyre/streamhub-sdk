'use strict'

var Content = require('streamhub-sdk/content');
var ContentClient = require('streamhub-sdk/content/clients/content-client');
var fetchContent = require('streamhub-sdk/content/fetch-content');
var StateToContent = require('streamhub-sdk/content/state-to-content');

describe('streamhub-sdk/content/fetch-content', function () {
    var CONST = {
        ENV: 't402.livefyre.com',
        NET: 'livefyre.com',
        COLL: '10664748',
        CONT: '26383395',
        RESP: {
            "status": "ok",
            "code": 200,
            "data": {
              "content": [
                {
                  "source": 5,
                  "content": {
                    "replaces": "",
                    "parentId": "",
                    "bodyHtml": "<p>Yeahaa<\/p>",
                    "id": "26383395",
                    "authorId": "_u2012@livefyre.com",
                    "updatedAt": 1360954422,
                    "annotations": {
                      "moderator": true
                    },
                    "createdAt": 1360954422
                  },
                  "vis": 1,
                  "type": 0,
                  "event": 1.3609544225837e+15,
                  "childContent": [
                    
                  ]
                },
                {
                  "content": {
                    "targetId": "26383395",
                    "authorId": "-",
                    "link": "",
                    "position": 1,
                    "oembed": {
                      "provider_url": "http:\/\/www.flickr.com\/",
                      "version": "1.0",
                      "title": "ZB8T0193",
                      "url": "http:\/\/farm4.static.flickr.com\/3123\/2341623661_7c99f48bbf_m.jpg",
                      "author_name": "Bees",
                      "height": 160,
                      "width": 240,
                      "html": "",
                      "thumbnail_width": 0,
                      "provider_name": "Flickr",
                      "thumbnail_url": "",
                      "type": "photo",
                      "thumbnail_height": 0,
                      "author_url": "http:\/\/www.flickr.com\/photos\/bees\/"
                    },
                    "id": "oem-1-26383395"
                  },
                  "vis": 1,
                  "type": 3,
                  "event": 1.3609544230153e+15,
                  "source": 0
                },
                {
                  "content": {
                    "targetId": "26383395",
                    "authorId": "-",
                    "link": "",
                    "position": 0,
                    "oembed": {
                      "provider_url": "http:\/\/www.flickr.com\/",
                      "version": "1.0",
                      "title": "ZB8T0193",
                      "url": "http:\/\/farm4.static.flickr.com\/3123\/2341623661_7c99f48bbf_m.jpg",
                      "author_name": "Bees",
                      "height": 160,
                      "width": 240,
                      "html": "",
                      "thumbnail_width": 0,
                      "provider_name": "Flickr",
                      "thumbnail_url": "",
                      "type": "photo",
                      "thumbnail_height": 0,
                      "author_url": "http:\/\/www.flickr.com\/photos\/bees\/"
                    },
                    "id": "oem-0-26383395"
                  },
                  "vis": 1,
                  "type": 3,
                  "event": 1.3609544229149e+15,
                  "source": 0
                }
              ],
              "meta": {
                "page": 572
              },
              "authors": {
                "_u2012@livefyre.com": {
                  "displayName": "ben",
                  "tags": [
                    
                  ],
                  "profileUrl": "http:\/\/www.t402.livefyre.com\/profile\/5011\/",
                  "avatar": "http:\/\/avatars-staging.fyre.co\/a\/1\/d627b1ba3fce6ab0af872ed3d65278fd\/50.jpg",
                  "type": 1,
                  "id": "_u2012@livefyre.com"
                }
              }
            }
          },
          ERR: 'ERROR'
    };
    
    it('is a function', function () {
        expect(fetchContent).toEqual(jasmine.any(Function));
    });
    
    describe('when called', function () {
        var opts,
            contentClient,
            callSucceed,
            callback;
            
        beforeEach(function () {
            contentClient = new ContentClient();
            opts = {
                network: CONST.NET,
                collectionId: CONST.COLL,
                contentId: CONST.CONT,
                contentClient: contentClient
            };
            callback = jasmine.createSpy('callback');
            
            callSucceed = true;
            spyOn(contentClient, 'getContent').andCallFake(function (opts, callback) {
                if (callSucceed) {
                    callback(undefined, CONST.RESP.data);
                } else {
                    callback(CONST.ERR);
                }
            });
        });

            
        it('throws when opts or callback aren\'t specified', function () {
            expect(function () {
                fetchContent();
            }).toThrow();
            
            expect(function () {
                fetchContent(opts);
            }).toThrow();
            
            expect(function () {
                fetchContent(undefined, callback);
            }).toThrow();
        });
        
        it('throws when attempted without opts.network, opts.collectionId or opts.contentId', function () {
            delete opts.network;
            expect(function () {
                fetchContent(opts, callback);
            }).toThrow();

            opts.network = CONST.NET;
            delete opts.collectionId;
            expect(function () {
                fetchContent(opts, callback);
            }).toThrow();
            
            opts.network = CONST.COLL;
            delete opts.contentId;
            expect(function () {
                fetchContent(opts, callback);
            }).toThrow();
        });
        
        it('optionally uses opts.contentClient', function () {
            fetchContent(opts, callback);
            expect(contentClient.getContent).toHaveBeenCalled();
        });
        
        it('optionally passes opts.depthOnly and opts.environment to the content client', function () {
            opts.environment = CONST.ENV;
            opts.depthOnly = true;
            
            fetchContent(opts, callback);
            expect(contentClient.getContent).toHaveBeenCalled();
            expect(contentClient.getContent.calls[0].args[0].environment).toBe(CONST.ENV);
            expect(contentClient.getContent.calls[0].args[0].depthOnly).toBe(true);
        });
        
        xit('optionally passes opts.replies to StateToContent', function () {
            throw 'TODO (joao) Figure this out!';
            opts.replies = false;
            
            fetchContent(opts, callback);
            expect(contentClient.getContent).toHaveBeenCalled();
            expect(contentClient.getContent.calls[0].args[0].depthOnly).toBe(true);
        });
        
        it('passes errors to the callback function as the first parameter', function () {
            callSucceed = false;
            
            fetchContent(opts, callback);
            waitsFor(function () {
                return callback.callCount;
            }, 'callback to get called', 1000);
            runs(function () {
                expect(callback).toHaveBeenCalledWith(CONST.ERR);
            });
        });
        
        it('passes the desired Content to the callback function as the second parameter', function () {
            fetchContent(opts, callback);
            expect(contentClient.getContent).toHaveBeenCalled();
            waitsFor(function () {
                return callback.callCount;
            }, 'callback to get called', 1000);
            runs(function () {
                var content = callback.calls[0].args[1];
                expect(content instanceof Content).toBe(true);
                expect(content.attachments.length).toBe(2);
            });
        });
    });
});
