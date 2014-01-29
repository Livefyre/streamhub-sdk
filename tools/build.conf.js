({
  mainConfigFile: '../requirejs.conf.js',
  paths: {
    jquery: 'lib/jquery/jquery.min',
    almond: 'lib/almond/almond'
  },
  baseUrl: '..',
  name: "streamhub-sdk",
  include: [
    'almond',
    'streamhub-sdk/collection',
    'streamhub-sdk/content',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-sdk/views/list-view',
    'streamhub-sdk/auth',
    'streamhub-sdk/modal',
    'streamhub-sdk/views/streams/injector'
  ],
  stubModules: ['text', 'hgn', 'json'],
  out: "../dist/streamhub-sdk.min.js",
  namespace: 'Livefyre',
  pragmasOnSave: {
    excludeHogan: true
  },
  cjsTranslate: true,
  optimize: "uglify2",
  preserveLicenseComments: false,
  uglify2: {
    compress: {
      unsafe: true
    },
    mangle: true
  },
  generateSourceMaps: true,
  onBuildRead: function(moduleName, path, contents) {
    switch (moduleName) {
      case "jquery":
      case "base64":
        contents = "define([], function(require, exports, module) {" + contents + "});";
    }
    return contents;
  }
})
