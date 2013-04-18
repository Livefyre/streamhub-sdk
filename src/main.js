define([
    'streamhub-sdk/stream',
    'streamhub-sdk/event-emitter',
    'streamhub-sdk/content/content',
    'streamhub-sdk/view',
    'streamhub-sdk/clients/livefyre-stream-client',
    'streamhub-sdk/clients/livefyre-bootstrap-client',
    'streamhub-sdk/clients/livefyre-write-client',
    'streamhub-sdk/streams/livefyre-stream',
    'streamhub-sdk/streams/livefyre-reverse-stream',
    'streamhub-sdk/stream-manager',
    'streamhub-sdk/stream-helpers/livefyre-helper',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/views/list-view',
    'streamhub-sdk/views/media-wall-view',
    'text!streamhub-sdk/version.txt'
], function(
    Stream,
    EventEmitter,
    Content,
    View,
    LivefyreStreamClient,
    LivefyreBootstrapClient,
    LivefyreWriteClient,
    LivefyreStream,
    LivefyreReverseStream,
    StreamManager,
    LivefyreStreamHelper,
    LivefyreContent,
    ListView,
    MediaWallView,
    VersionInfo
) {
    var Hub = {};
    Hub.Stream = Stream;
    Hub.EventEmitter = EventEmitter;
    Hub.Content = Content;
    Hub.View = View;

    Hub.Clients = {};
    Hub.Clients.LivefyreStreamClient = LivefyreStreamClient;
    Hub.Clients.LivefyreBootstrapClient = LivefyreBootstrapClient;
    Hub.Clients.LivefyreWriteClient = LivefyreWriteClient;

    Hub.Streams = {};
    Hub.Streams.LivefyreStream = LivefyreStream;
    Hub.Streams.LivefyreReverseStream = LivefyreReverseStream;

    Hub.StreamManager = StreamManager;

    Hub.ContentTypes = {};
    Hub.ContentTypes.LivefyreContent = LivefyreContent;

    Hub.Views = {};
    Hub.Views.ListView = ListView;
    Hub.Views.MediaWallView = MediaWallView;
    
    Hub.version = VersionInfo.trim();

    return Hub;
});