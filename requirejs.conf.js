require.config({
  baseUrl: '/',
  paths: {
    jquery: 'lib/jquery/jquery',
    'jquery-isotope': 'lib/isotope/jquery.isotope',
    'jquery-imagesloaded': 'lib/imagesloaded/jquery.imagesloaded',
    text: 'lib/requirejs-text/text',
    base64: 'lib/base64/base64',
    hogan: 'lib/hogan/web/builds/2.0.0/hogan-2.0.0.amd',
    hgn: 'lib/requirejs-hogan-plugin/hgn',
    jasmine: 'lib/jasmine/lib/jasmine-core/jasmine',
    'jasmine-html': 'lib/jasmine/lib/jasmine-core/jasmine-html',
    'jasmine-jquery': 'lib/jasmine-jquery/lib/jasmine-jquery',
  },
  packages: [{
     name: "streamhub-sdk",
     location: "src/"
  },{
     name: "streamhub-sdk-tests",
     location: "tests/"
  }],
  shim: {
    jquery: {
        exports: '$'
    },
    'jquery-isotope': {
        deps: ['jquery']
    },
    'jquery-imagesloaded': {
        deps: ['jquery']
    },
    jasmine: {
        exports: 'jasmine'
    },
    'jasmine-html': {
        deps: ['jasmine'],
        exports: 'jasmine'
    },
    'jasmine-jquery': {
        deps: ['jquery', 'jasmine']
    }
  },
  urlArgs: "_=" +  (new Date()).getTime()
});
