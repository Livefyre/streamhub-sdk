define([
    'jquery',
    'jasmine',
    'streamhub-sdk',
    'streamhub-sdk/clients/livefyre-bootstrap-client',
    'jasmine-jquery'],
function ($, jasmine, Hub, LivefyreBootstrapClient) {
    describe('A Streamhub SDK', function () {

        var callback, opts;
        
        beforeEach(function() {
            callback = jasmine.createSpy();
            opts = {
                "network": "labs-t402.fyre.co",
                "siteId": "303827",
                "articleId": "gene_publish_0",
                "environment": "t402.livefyre.com"
            };
            spy = spyOn(LivefyreBootstrapClient, "getContent").andCallFake(function(opts, fn) {
                var mockData = {"networkId": "labs-t402.fyre.co", "archiveInfo": {"nPages": 5, "pageInfo": {"1": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/1.json", "last": 1359851209, "first": 1359839728}, "0": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/0.json", "last": 1359839709, "first": 1359668916}, "3": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/3.json", "last": 1359853588, "first": 1359852338}, "2": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/2.json", "last": 1359852289, "first": 1359851232}, "4": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/4.json", "last": 1363808883, "first": 1359853608}}, "pathBase": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/"}, "allowEditComments": false, "collectionId": "10669131", "url": "", "checksum": "", "bootstrapUrl": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/head.json", "title": "", "numVisible": 250, "nestLevel": 0, "siteId": "303827", "commentsDisabled": false, "allowGuestComments": false, "followers": 2, "config": {"nestLevel": 4, "__modified__": 1363808940.388546}, "data": [], "event": 1363808883984267, "editCommentInterval": 0};
                fn(null, mockData);
            });
        });

        xit ("should create streams when createLivefyreStreams is called", function () {
            Hub.createLivefyreStreams(opts, callback);
    
            waitsFor(function() {
                return callback.callCount > 0;
            });
            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(callback.callCount).toBe(1);
                expect(callback.mostRecentCall.args[0]).toBeNull();
                expect(callback.mostRecentCall.args[1]).toBeDefined();
                expect(callback.mostRecentCall.args[1].main).toBeDefined();
                expect(callback.mostRecentCall.args[1].reverse).toBeDefined();
                expect(callback.mostRecentCall.args[1].reverse.page).toBe('4');
            });                            
        });
    }); 
});