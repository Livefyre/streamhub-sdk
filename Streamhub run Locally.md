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