require.config({
  paths: {
    jquery: '/lib/jquery/jquery',
    text: '/lib/requirejs-text/text',
    base64: '/lib/base64/base64',
    mustache: '/lib/mustache/mustache',
    jasmine: '/lib/jasmine/lib/jasmine-core/jasmine',
    'jasmine-html': '/lib/jasmine/lib/jasmine-core/jasmine-html',
    'jasmine-jquery': '/lib/jasmine-jquery/lib/jasmine-jquery'
  },
  packages: [{
     name: "streamhub-sdk",
     location: "/src/"
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
    'jasmine-jquery': {
        deps: ['jquery', 'jasmine']
    }
  },
  urlArgs: "_=" +  (new Date()).getTime()
});
