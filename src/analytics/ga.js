define(['require', 'streamhub-sdk/debug'], function (require, debug) {
  var log = debug('streamhub-sdk/ga');
  var module;
  var GLOBAL_NAME = 'lfga';
  var getGlobal = function () { return window[window.GoogleAnalyticsObject]; };
  var ga = getGlobal();

  if ( ! ga) {
    // Setup temporary Google Analytics objects.
    window.GoogleAnalyticsObject = GLOBAL_NAME;
    ga = window[GLOBAL_NAME] = window[GLOBAL_NAME] || function () {
      var queue = window[GLOBAL_NAME].q = window[GLOBAL_NAME].q || [];
      queue.push(arguments);
    }
    window[GLOBAL_NAME].l=1*new Date()
    ga = getGlobal();
  }

  // Asynchronously load Google Analytics, letting it take over our `window.ga`
  // object after it loads. This allows us to add events to `window.ga` even
  // before the library has fully loaded.
  var script = document.createElement('script');
  var otherScript = document.getElementsByTagName('script')[0];
  script.async = 1;
  script.src = 'http://www.google-analytics.com/analytics.js';
  otherScript.parentNode.insertBefore(script, otherScript);

  // Create a function that wraps `window.ga`.
  // This allows dependant modules to use `window.ga` without knowingly
  // programming against a global object.
  function useGa () {
    getGlobal().apply(this, arguments);
  };

  return useGa;

});