# streamhub-sdk

[![Build Status](https://travis-ci.org/Livefyre/streamhub-sdk.png)](https://travis-ci.org/Livefyre/streamhub-sdk) [![Coverage Status](https://coveralls.io/repos/Livefyre/streamhub-sdk/badge.png?branch=master)](https://coveralls.io/r/Livefyre/streamhub-sdk?branch=master)

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

You can use streamhub-sdk either by including a built version from Livefyre.js or using this repository locally.

### CDN

To include it in your page from the CDN, add a script tag to your HTML file.

    <script src="https://cdn.livefyre.com/Livefyre.js"></script>

Then use `Livefyre.require` to load streamhub-sdk

```javascript
Livefyre.require(['streamhub-sdk#2'], function (SDK) {
    console.log('streamhub-sdk', SDK);
});
```

See this in action in this example: http://jsbin.com/locufi/1/edit?html,console

Note: Any styling customization of Tweets rendered by streamhub-sdk must be done in accordance with Twitter's [Display Requirements](https://dev.twitter.com/terms/display-requirements).

### Local Development

To run locally, make sure you have NPM. It is bundled with [node.js](http://nodejs.org/)

    npm install

This will install devDependencies and then use [Bower](https://github.com/twitter/bower) to download client-side dependencies to `lib/`.

Run a web server for the project

    npm start

Then check out [http://localhost:8080/examples/listview](http://localhost:8080/examples/listview) for an example of `streamhub-sdk/views/list-view`

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

### Followers

Users can follow/unfollow collections. Followers (`streamhub-sdk/collection/followers`)
provides access to all of the users currently following the collection as well
as new following or unfollowing updates from the stream.

    var followers = new Followers(collection);
    followers.on('followers', function (followersArray) {
        followersArray.forEach(function (follower) {
            controller[follower.following ? 'addFollower' || 'removeFollower'](follower.id);
        });
    }).on('error', function (err) {
        console.error(err);
    });

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


# Set up local environment
The steps are assuming a base development folder structure as: `~/dev`. Meaning all repos live within that folder.

## Set up SDK
1. Clone: `git clone git@github.com:Livefyre/streamhub-sdk.git`
2. Build: `make`

## Set up Media Wall
1. Clone: `git clone git@github.com:Livefyre/streamhub-wall.git`
2. Build: `make`
3. Symlink SDK:
- `cd lib`
- `rm -rf streamhub-sdk/`
- `ln -s ~/dev/streamhub-sdk/ streamhub-sdk`
4. Update example collection:
- https://github.com/Livefyre/streamhub-wall/blob/master/examples/mediawall/index.html#L161
- Point at different example collection or create own based on collection you are debugging
5. Run: `make run`
6. Load: http://localhost:8080/examples/mediawall

## Notes
- The only time you'll need to continuously `make` the SDK is when you are making CSS changes (This will require a `make` of Wall as well)
- NPM version should be `v6.7.0`
- If Bower asks to pick dependency version, always pick latest version (e.g. pick `2.37.16` instead of `2.37.10`)

## Release SDK updates to the visualization apps
1. Bump the SDK version
- https://github.com/Livefyre/streamhub-sdk/blob/master/bower.json#L3
- https://github.com/Livefyre/streamhub-sdk/blob/master/package.json#L5
2. Release the SDK
- https://github.com/Livefyre/streamhub-sdk/releases
3. Bump the version of the app and SDK for EACH of the apps
- Example: https://github.com/Livefyre/streamhub-wall/pull/487/files

### Apps to update
1. https://git.corp.adobe.com/livefyre/carousel-component (Carousel)
2. https://git.corp.adobe.com/livefyre/filmstrip-app (Filmstrip)
3. https://git.corp.adobe.com/Livefyre/mosaic-component (Mosaic)
4. https://git.corp.adobe.com/Livefyre/single-card-component (Feature Card)
5. https://github.com/Livefyre/streamhub-map (Map)
6. https://github.com/Livefyre/streamhub-wall (Media Wall)

