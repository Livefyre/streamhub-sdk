({
  mainConfigFile: '../requirejs.conf.js',
  paths: {
    jquery: 'lib/jquery/jquery.min',
    almond: 'lib/almond/almond'
  },
  baseUrl: '..',
  cjsTranslate: true,
  name: "streamhub-sdk",
  include: [
    'almond',
    'streamhub-sdk/collection',
    'streamhub-sdk/content',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-sdk/views/list-view',
    'streamhub-sdk/auth',
    'streamhub-sdk/modal'
  ],
  stubModules: ['text', 'hgn', 'json'],
  out: "../dist/streamhub-sdk.min.js",
  namespace: 'Livefyre',
  pragmasOnSave: {
    excludeHogan: true
  },
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
    if (moduleName == "jquery") {
      contents = "define([], function(require, exports, module) {" + contents + "});";
    }
    return contents;
  }
})
