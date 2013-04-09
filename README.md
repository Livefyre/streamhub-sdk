# streamhub-sdk

SDK to stream Content from Livefyre's StreamHub platform, create Views to render Streams and Content, and build amazing real-time social web applications.

## Getting Started

Make sure you have NPM. It is bundled with [node.js](http://nodejs.org/)

    npm install

This will install devDependencies and then use [Bower](https://github.com/twitter/bower) to download client-side dependencies to `lib/`.

Run a web server for the project

    npm start

Then check out [http://localhost:8080/examples/listview](http://localhost:8080/examples/listview) for an example of `streamhub-sdk/views/list-view`

## Content

`streamhub-sdk/content/content` provides a structured base class to represent any Content on the web. Content must only have a `.body`, which is an HTML string.

    var content = new Content('<p>Hello, world!</p>');
    c.body; // '<p>Hello, world!</p>';

Content can also have the following properties:

* more Content instances in its Array of `.replies`
* `streamhub-sdk/content/types/oembed` instances in an array of `.attachments`
* an `.author` object

Along with the Content base class, this SDK is bundled with:

* `streamhub-sdk/content/types/livefyre-content`: Content sourced from Livefyre StreamHub
* `streamhub-sdk/content/types/livefyre-twitter-content`: Tweets sourced from Livefyre StreamHub
* `streamhub-sdk/content/types/oembed`: oEmbed Content
* `streamhub-sdk/content/types/twitter-content`: Base class for Twitter Content
* `streamhub-sdk/content/types/twitter-streaming-content`: Twitter Content constructed from Twitter Streaming API response JSON
* `streamhub-sdk/content/types/twitter-search-content`: Twitter Content constructed from Twitter Search API response JSON

### ContentViews

Usually you will want to render Content in a DOMElement using a `streamhub-sdk/content/views/content-view`.

    var contentView = new ContentView({
        content: new Content('<p>Hello, world!</p>'),
        el: document.getElementById('example')
    });

By default, this will render Content using the included `hgn!streamhub-sdk/content/templates/content.mustache` template to show the author's avatar and name with the content `.body` and any `.attachments`.

Also included is `streamhub-sdk/content/views/twitter-content-view`, a ContentView subclass for rendering tweets. This includes the twitter logo and the default template includes twitter's @anywhere intents for viewing the author's twitter profile as well as replying, retweeting, and favoriting the tweet.
    

## Streams

Streams provide a standard interface to remote sources of Content, and behave like [node.js streams2](http://nodejs.org/api/stream.html#stream_compatibility).

    stream.on('readable', function () {
        var content = stream.read();
        content instanceof require('streamhub-sdk/content/content'); //true
    }).start();

Livefyre StreamHub is a great source of Content, so this SDK includes two Stream subclasses to stream Content from StreamHub:

* `streamhub-sdk/streams/livefyre-stream`: Stream new, real-time Content in a Livefyre Collection
* `streamhub-sdk/streams/livefyre-reverse-stream`: Stream content from a Livefyre Collection in reverse-chronological order. Useful to load older Content in views of a Collection.

`streamhub-sdk/streams/livefyre-collection-streams`, aliased at `Hub.Streams.forCollection(opts)` provides a helper constructor that returns an object with a `.main` LivefyreStream and a `.reverse` LivefyreReverseStream for a given StreamHub Collection. It also provides `.start` and `.on` methods that will apply to both Streams.

    var streams = new Hub.Streams.forCollection({
        "network": "labs-t402.fyre.co",
        "siteId": "303827",
        "articleId": "labs_demo_fire",
        "environment": "t402.livefyre.com"
    });
    
    streams.on('readable', function (stream) {
    	var content = stream.read();
    )).start();

## Views

Views can render a Stream of Content into ContentViews to create real-time social Content experiences.

`streamhub-sdk/views/list-view` provides a basic view that will render a Stream of Content as an unordered list.

    var view = new ListView({
        streams: new Hub.Streams.forCollection(opts),
        el: document.getElementById('example');
    });

## CSS

The following CSS files are included as good defaults for your embedded Content experiences:

* `src/content/css/content.less`: CSS for ContentViews
* `src/views/css/list-view.less`: CSS for ListViews
