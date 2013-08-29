define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/auth',
    'streamhub-sdk/debug',
    'streamhub-sdk/event-emitter',
    'streamhub-sdk/storage',
    'streamhub-sdk/stream',
    'streamhub-sdk/stream-manager',
    'streamhub-sdk/util',
    'streamhub-sdk/view',
    'streamhub-sdk/clients/livefyre-stream-client',
    'streamhub-sdk/clients/livefyre-bootstrap-client',
    'streamhub-sdk/clients/livefyre-write-client',
    'streamhub-sdk/content/content',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-facebook-content',
    'streamhub-sdk/content/types/livefyre-twitter-content',
    'streamhub-sdk/content/types/livefyre-instagram-content',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/content/types/twitter-content',
    'streamhub-sdk/content/views/attachment-list-view',
    'streamhub-sdk/content/views/content-view',
    'streamhub-sdk/content/views/oembed-view',
    'streamhub-sdk/content/views/facebook-content-view',
    'streamhub-sdk/content/views/twitter-content-view',
    'streamhub-sdk/content/views/instagram-content-view',
    'streamhub-sdk/streams/livefyre-stream',
    'streamhub-sdk/streams/livefyre-reverse-stream',
    'streamhub-sdk/stream-helpers/livefyre-helper',
    'streamhub-sdk/views/list-view',
    'text!streamhub-sdk/version.txt'
], function(
    $,
    Auth,
    debug,
    EventEmitter,
    Storage,
    Stream,
    StreamManager,
    Util,
    View,
    LivefyreStreamClient,
    LivefyreBootstrapClient,
    LivefyreWriteClient,
    Content,
    LivefyreContent,
    LivefyreFacebookContent,
    LivefyreTwitterContent,
    LivefyreInstagramContent,
    Oembed,
    TwitterContent,
    AttachmentListView,
    ContentView,
    OembedView,
    FacebookContentView,
    TwitterContentView,
    InstagramContentView,
    LivefyreStream,
    LivefyreReverseStream,
    LivefyreHelper,
    ListView,
    VersionInfo
) {
    var Hub = {};
    Hub.debug = debug;
    Hub.Auth = Auth;
    Hub.EventEmitter = EventEmitter;
    Hub.Storage = Storage;
    Hub.Stream = Stream;
    Hub.StreamManager = StreamManager;
    Hub.Util = Util;
    Hub.View = View;
    
    Hub.Clients = {};
    Hub.Clients.LivefyreStreamClient = LivefyreStreamClient;
    Hub.Clients.LivefyreBootstrapClient = LivefyreBootstrapClient;
    Hub.Clients.LivefyreWriteClient = LivefyreWriteClient;

    Hub.Content = Content;

    Hub.Content.Types = {};
    Hub.Content.Types.LivefyreContent = LivefyreContent;
    Hub.Content.Types.LivefyreFacebookContent = LivefyreFacebookContent;
    Hub.Content.Types.LivefyreTwitterContent = LivefyreTwitterContent;
    Hub.Content.Types.LivefyreInstagramContent = LivefyreInstagramContent;
    Hub.Content.Types.Oembed = Oembed;
    Hub.Content.Types.TwitterContent = TwitterContent;

    Hub.Content.Views = {};
    Hub.Content.Views.AttachmentListView = AttachmentListView;
    Hub.Content.Views.ContentView = ContentView;
    Hub.Content.Views.OembedView = OembedView;
    Hub.Content.Views.FacebookContentView = FacebookContentView;
    Hub.Content.Views.TwitterContentView = TwitterContentView;
    Hub.Content.Views.InstagramContentView = InstagramContentView;
    
    Hub.Streams = {};
    Hub.Streams.LivefyreStream = LivefyreStream;
    Hub.Streams.LivefyreReverseStream = LivefyreReverseStream;
    
    Hub.Streams.Helpers = {};
    Hub.Streams.Helpers.LivefyreHelper = LivefyreHelper;

    Hub.Views = {};
    Hub.Views.ListView = ListView;
    
    Hub.version = $.trim(VersionInfo);

    return Hub;
});
