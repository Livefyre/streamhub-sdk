define([
    'streamhub-sdk/jquery',
    'jasmine',
    'streamhub-sdk',
    'jasmine-jquery',
    'streamhub-sdk-tests/mocks/jasmine-spy-stream',
    'streamhub-sdk/clients/livefyre-bootstrap-client',
    'streamhub-sdk/streams/livefyre-stream',
    'streamhub-sdk/streams/livefyre-reverse-stream'],
function ($, jasmine, Hub, jasminejquery, JasmineSpyStream, LivefyreBootstrapClient,
LivefyreStream, LivefyreReverseStream) {
    describe('Livefyre StreamManager Helper', function () {
        it('is registered with StreamManager.create on require', function () {
            expect(Hub.StreamManager.create.livefyreStreams).toBeDefined();
            expect(typeof Hub.StreamManager.create.livefyreStreams).toBe('function');
        });

        beforeEach(function () {

        });

        it("doesn't use LivefyreBootstrapClient until .start()", function () {
            var mockData = { "collectionSettings": {"networkId": "labs-t402.fyre.co", "archiveInfo": {"nPages": 5, "pageInfo": {"1": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/1.json", "last": 1359851209, "first": 1359839728}, "0": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/0.json", "last": 1359839709, "first": 1359668916}, "3": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/3.json", "last": 1359853588, "first": 1359852338}, "2": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/2.json", "last": 1359852289, "first": 1359851232}, "4": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/4.json", "last": 1360283812, "first": 1359853608}}, "pathBase": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/"}, "allowEditComments": false, "collectionId": "10669131", "url": "", "checksum": "", "bootstrapUrl": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/head.json", "title": "", "numVisible": 248, "nestLevel": 0, "siteId": "303827", "commentsDisabled": false, "allowGuestComments": false, "followers": 2, "config": {"nestLevel": 4, "__modified__": 1360628410.86003}, "data": [], "event": 1360628346051952, "editCommentInterval": 0} };
            spyOn(LivefyreBootstrapClient, 'getContent').andCallFake(function (opts, cb) {
                cb.call(this, null, mockData);
            });
            // Don't actually do anything when starting individual streams
            // prevents tests from causing ajax requests
            spyOn(LivefyreStream.prototype, 'start').andCallFake(function () {});
            spyOn(LivefyreReverseStream.prototype, 'start').andCallFake(function () {});

            var sm = Hub.StreamManager.create.livefyreStreams({});
            expect(LivefyreBootstrapClient.getContent).toHaveBeenCalled();
        });

        it("doesn't call LivefyreBootstrapClient more than once on multiple .start()s", function () {
            var mockData = { "collectionSettings": {"networkId": "labs-t402.fyre.co", "archiveInfo": {"nPages": 5, "pageInfo": {"1": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/1.json", "last": 1359851209, "first": 1359839728}, "0": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/0.json", "last": 1359839709, "first": 1359668916}, "3": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/3.json", "last": 1359853588, "first": 1359852338}, "2": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/2.json", "last": 1359852289, "first": 1359851232}, "4": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/4.json", "last": 1360283812, "first": 1359853608}}, "pathBase": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/"}, "allowEditComments": false, "collectionId": "10669131", "url": "", "checksum": "", "bootstrapUrl": "/t402.livefyre.com/labs-t402.fyre.co/303827/Z2VuZV9wdWJsaXNoXzA=/head.json", "title": "", "numVisible": 248, "nestLevel": 0, "siteId": "303827", "commentsDisabled": false, "allowGuestComments": false, "followers": 2, "config": {"nestLevel": 4, "__modified__": 1360628410.86003}, "data": [], "event": 1360628346051952, "editCommentInterval": 0} };
            spyOn(LivefyreBootstrapClient, 'getContent').andCallFake(function (opts, cb) {
                cb.call(this, null, mockData);
            });
            // Don't actually do anything when starting individual streams
            // prevents tests from causing ajax requests
            spyOn(LivefyreStream.prototype, 'start').andCallFake(function () {});
            spyOn(LivefyreReverseStream.prototype, 'start').andCallFake(function () {});

            var sm = Hub.StreamManager.create.livefyreStreams({});

            sm.start();
            sm.start();
            sm.start();

            expect(LivefyreBootstrapClient.getContent).toHaveBeenCalled()
            expect(LivefyreBootstrapClient.getContent.callCount).toBe(1);
        });

        it("creates a LivefyreReverseStream with the proper latest page", function () {
            // Previously this test failed because livefyre-helper did not properly sort the keys
            // of pageInfo before choosing the latestPage. Before then, this test passed in Chrome
            // but failed in Firefox. Never trust ordering of object props
            var mockData = { "collectionSettings": {"networkId": "labs-t402.fyre.co", "archiveInfo": {"nPages": 4632, "pageInfo": {"1": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/bGFic19kZW1vX2ZpcmU=/1.json", "last": 1364851975, "first": 1364851721}, "0": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/bGFic19kZW1vX2ZpcmU=/0.json", "last": 1364851720, "first": 1364851464}, "4631": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/bGFic19kZW1vX2ZpcmU=/4631.json", "last": 1366506807, "first": 1366506470}, "4630": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/bGFic19kZW1vX2ZpcmU=/4630.json", "last": 1366506470, "first": 1366506185}, "4627": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/bGFic19kZW1vX2ZpcmU=/4627.json", "last": 1366505515, "first": 1366505297}, "4628": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/bGFic19kZW1vX2ZpcmU=/4628.json", "last": 1366505871, "first": 1366505517}, "4629": {"url": "/t402.livefyre.com/labs-t402.fyre.co/303827/bGFic19kZW1vX2ZpcmU=/4629.json", "last": 1366506168, "first": 1366505883}}, "pathBase": "/t402.livefyre.com/labs-t402.fyre.co/303827/bGFic19kZW1vX2ZpcmU=/"}, "allowEditComments": false, "collectionId": "10683466", "url": "", "checksum": "686caf5982899005a219a89dedb2d09b", "bootstrapUrl": "/t402.livefyre.com/labs-t402.fyre.co/303827/bGFic19kZW1vX2ZpcmU=/head.json", "title": "", "numVisible": 232353, "nestLevel": 0, "siteId": "303827", "commentsDisabled": false, "allowGuestComments": false, "followers": 1, "config": {"nestLevel": 4, "__modified__": 1366506831.857396}, "data": [], "event": 1366506809817028, "editCommentInterval": 0} };

            spyOn(LivefyreBootstrapClient, 'getContent').andCallFake(function (opts, cb) {
                cb.call(this, null, mockData);
            });

            // Don't actually do anything when starting individual streams
            // prevents tests from causing ajax requests and decrementing pageNum
            spyOn(LivefyreStream.prototype, 'start').andCallFake(function () {});
            spyOn(LivefyreReverseStream.prototype, 'start').andCallFake(function () {});

            var sm = Hub.StreamManager.create.livefyreStreams({});

            sm.start();
            expect(sm.get().reverse.page).toBe('4631');
        });
    });
});