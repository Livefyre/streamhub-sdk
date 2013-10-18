# streamhub-sdk

SDK to stream Content from Livefyre's StreamHub platform, create Views to render Streams and Content, and build amazing real-time social web applications.

## Quick Example

To render Content from a StreamHub Collection as a list

    require([
    	'streamhub-sdk/collection',
    	'streamhub-sdk/content/views/content-list-view'],
    function (Collection, ListView) {
    
	    var collection = new Collection({
	        "network": "labs-t402.fyre.co",
	        "siteId": "303827",
	        "articleId": "xbox-0",
	        "environment": "t402.livefyre.com"
	    });
	    
	    var listView = new ListView({
	        el: document.getElementById("listView")
	    });
	
	    collection.pipe(listView);
	
    });

## Getting Started

You can use streamhub-sdk either by including a built version from a CDN or using this repository locally.

### CDN

To include it in your page from the CDN, add a script tag to your HTML file.

    <script src="http://cdn.livefyre.com/libs/sdk/v2.0.0/builds/253/streamhub-sdk.min.js"></script>

You can also include the default stylesheet

    <link rel="stylesheet" href="http://cdn.livefyre.com/libs/sdk/v2.0.0/builds/253/streamhub-sdk.min.css" />

See this in action in this jsfiddle: http://jsfiddle.net/K9qH3/13/

### Local Development

To run locally, make sure you have NPM. It is bundled with [node.js](http://nodejs.org/)

    npm install

This will install devDependencies and then use [Bower](https://github.com/twitter/bower) to download client-side dependencies to `lib/`.

Run a web server for the project

    npm start

Then check out [http://localhost:8080/examples/listview](http://localhost:8080/examples/listview) for an example of `streamhub-sdk/views/list-view`

## API Documentation

The full jsdoc documentation can be found at http://livefyre.github.io/streamhub-sdk

## Streams

Streams provide a standard interface to remote sources of Content, and behave like [node.js streams3](http://nodejs.org/api/stream.html#stream_compatibility).

The browser-compatible Stream interface is provided by [Livefyre/stream](https://github.com/livefyre/stream)

	// ad-hoc reading from a stream/readable
    stream.on('readable', function () {
        var content = stream.read();
        content instanceof require('streamhub-sdk/content'); //true
    });
    
    // Or if sending to a stream/writable
    stream.pipe(writable);

## Collections    

Livefyre StreamHub Collections are a great source of Content, so this SDK includes Stream subclasses for reading historical Content from Collections and accessing any new Live Updates

* `streamhub-sdk/collection`: Readable, will emit any new Content added to the Collection in real-time.
    * If piped to a Writable whose `.more` property is also a Writable (like `streamhub-sdk/views/list-view`), the Collection archive will be piped to `.more`. This sets up 'show more' behavior.
* `streamhub-sdk/collection/streams/updater`: Readable, streams real-time updates to a Collection.
* `streamhub-sdk/collection/streams/archive`: Readable, streams historical Content threads in a Collection in descending chronological order
* `streamhub-sdk/collection/streams/writer`: Writable, written Content will be posted to the Collection

Create a Collection

    var collection = new Collection({
	    "network": "labs-t402.fyre.co",
	    "siteId": "303827",
	    "articleId": "xbox-0",
	    "environment": "t402.livefyre.com"
	});
	
Send real-time updates

	collection.pipe(writable);

Create a new real-time updater manually

	var updater = collection.createUpdater();
	updater.pipe(writable);
	
Create a new archive Stream (historic Content)

	var archive = collection.createArchive();
	archive.pipe(writable);

Post Content

	require('streamhub-sdk/auth').setToken('lftoken');
	collection.write(new Content('Foo!'))
	
Create a new writer manually

	var writer = collection.createWriter();
	writer.write(new Content('Foo!'));

### Featured Content

StreamHub Collections support designating specific Content as 'featured', and
this Featured Content can be retrieved specifically as a
FeaturedContents object (`streamhub-sdk/collection/featured-contents`).

    var featuredContents = collection.createFeaturedContents();

Just like a Collection, FeaturedContents objects have a `.createArchive()` method
that returns a `stream/readable` that you can pipe into a ListView to display the Featured Contents.

    var featuredArchive = featuredContents.createArchive();
    var listView = new ListView();
    featuredArchive.pipe(listView);
    listView.$el.appendTo('body');

## ListViews

ListViews can render a Stream of Content into ContentViews to create real-time social Content experiences.

`streamhub-sdk/views/list-view` provides a basic view that will render a Stream of Content as an unordered list. ListViews are subclasses of `stream/writable`, so they can be written and piped to.

    var view = new ListView({
        el: document.getElementById('example')
    });

    view.write(new Content('<p>Hello</p>'));

ListViews also have a `.more` property that is a `stream/transform`, and any streams piped to it will be throttled behind a "Show More" button. Piping a `streamhub-sdk/collection` to a ListView automatically pipes an archive to `.more`.

Thus this:

    collection.pipe(view);

Is equivalent to:

    collection.createUpdater().pipe(view);
    collection.createArhcive().pipe(view.more);

You can configure the "Show More" behavior of ListViews:

    var view = new ListView({
    	// Number of initial items to display
        initial: 50,
        // Number of items to load when the
        // 'Show More' button is clicked
        showMore: 50
    });

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
* `streamhub-sdk/content/types/livefyre-facebook-content`: Facebook posts sourced from Livefyre StreamHub
* `streamhub-sdk/content/types/livefyre-oembed`: oEmbed Content sourced from Livefyre StreamHub

### ContentViews

Usually you will want to render Content in a DOMElement using a `streamhub-sdk/content/views/content-view`.

    var contentView = new ContentView({
        content: new Content('<p>Hello, world!</p>'),
        el: document.getElementById('example')
    });

By default, this will render Content using the included `hgn!streamhub-sdk/content/templates/content.mustache` template to show the author's avatar and name with the content `.body` and any `.attachments`.

These other ContentViews are also included:

* `streamhub-sdk/content/views/twitter-content-view`, a ContentView subclass for rendering tweets. This includes the twitter logo and the default template includes twitter's @anywhere intents for viewing the author's twitter profile as well as replying, retweeting, and favoriting the tweet.
* `streamhub-sdk/content/views/facebook-content-view`, which renders Content with a Facebook logo.


## CSS

The following CSS files are included as good defaults for your embedded Content experiences:

* `src/content/css/content.less`: CSS for ContentViews
* `src/views/css/list-view.less`: CSS for ListViews
* `src/css/style.less`: All SDK CSS (bundles the above)

