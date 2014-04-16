require.config({
  paths: {
    jquery: 'lib/jquery/jquery',
    text: 'lib/requirejs-text/text',
    base64: 'lib/base64/base64.min',
    hogan: 'lib/hogan/web/builds/2.0.0/hogan-2.0.0.amd',
    hgn: 'lib/requirejs-hogan-plugin/hgn',
    json: 'lib/requirejs-plugins/src/json',
    jasmine: 'lib/jasmine/lib/jasmine-core/jasmine',
    'jasmine-html': 'lib/jasmine/lib/jasmine-core/jasmine-html',
    'jasmine-jquery': 'lib/jasmine-jquery/lib/jasmine-jquery',
    'event-emitter': 'lib/event-emitter/src/event-emitter',
    inherits: 'lib/inherits/inherits',
    blanket: 'lib/blanket/dist/qunit/blanket',
    'blanket-jasmine': 'lib/blanket/dist/jasmine/blanket_jasmine'
  },
  map: {
    '*': {
      'debug': 'streamhub-sdk/debug'
    }
  },
  packages: [{
    name: "streamhub-sdk",
    location: "src"
  },{
    name: "streamhub-sdk/auth",
    location: "src/auth"
  },{
    name: "streamhub-sdk/collection",
    location: "src/collection"
  },{
    name: "streamhub-sdk/content",
    location: "src/content"
  },{
    name: "streamhub-sdk/modal",
    location: "src/modal"
  },{
    name: "streamhub-sdk/ui",
    location: "src/ui"
  },{
    name: "streamhub-sdk/jquery",
    location: "src",
    main: "jquery"
  },{
    name: "streamhub-sdk-tests",
    location: "tests"
  },{
    name: "stream",
    location: "lib/stream/src"
  },{
    name: "view",
    location: "lib/view/src",
    main: "view"
  },{
    name: "auth",
    location: "lib/auth/src"
  },{
    name: "auth-livefyre",
    location: "lib/auth-livefyre/src"
  },{
    name: "auth-livefyre-tests",
    location: "lib/auth-livefyre/test"
  }],
  shim: {
    jquery: {
        exports: '$'
    },
    jasmine: {
        exports: 'jasmine'
    },
    'jasmine-html': {
        deps: ['jasmine'],
        exports: 'jasmine'
    },
    'blanket-jasmine': {
        exports: 'blanket',
        deps: ['jasmine']
    },
    'jasmine-jquery': {
        deps: ['jquery']
    }
  }
});
