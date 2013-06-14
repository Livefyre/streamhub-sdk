({
  paths: {
    jquery: 'lib/zepto/zepto',
    base64: 'lib/base64/base64',
    almond: 'lib/almond/almond',
    text: 'lib/requirejs-text/text',
    hogan: 'lib/hogan/web/builds/2.0.0/hogan-2.0.0.amd',
    hgn: 'lib/requirejs-hogan-plugin/hgn'
    'streamhub-zepto': 'lib/streamhub-zepto/build/zepto.min'
  },
  packages: [{
     name: "streamhub-sdk",
     location: "src"
  }],
  baseUrl: '.',
  name: "streamhub-sdk",
  exclude: ['jquery', 'almond', 'base64'],
  stubModules: ['text', 'hgn'],
  pragmasOnSave: {
    excludeHogan: true
  },
  namespace: 'Livefyre',
  out: "streamhub-sdk.built.js",
  optimize: "uglify2",
  uglify2: {
    compress: {
      unsafe: true
    },
    mangle: true
  }
})
