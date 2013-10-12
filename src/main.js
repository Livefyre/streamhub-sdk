define([
    'streamhub-sdk/jquery',
    'text!streamhub-sdk/version.txt',
    'streamhub-sdk/analytics'],
function($, version, Analytics) {
    'use strict';

    // Track a pageview
    var analytics = new Analytics();
    analytics.pageview();

    return {
        analytics: analytics,
        version: $.trim(version)
    };
});
