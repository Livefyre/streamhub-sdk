({
  mainConfigFile: './requirejs.conf.js',
  paths: {
    jquery: 'lib/jquery/jquery.min',
    almond: 'lib/almond/almond'
  },
  baseUrl: '.',
  name: "streamhub-sdk",
  include: ['almond', 'streamhub-sdk/collection'],
  stubModules: ['text', 'hgn', 'json'],
  out: "streamhub-sdk.min.js",
  namespace: 'Livefyre',
  pragmasOnSave: {
    excludeHogan: true
  },
  optimize: "uglify2",
  uglify2: {
    compress: {
      unsafe: true
    },
    mangle: true
  },
  onBuildRead: function(moduleName, path, contents) {
    if (moduleName == "jquery") {
      contents = "define([], function(require, exports, module) {" + contents + "});";
    }
    return contents;
  }
})
