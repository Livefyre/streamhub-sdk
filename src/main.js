define(['streamhub-sdk/jquery', 'text!streamhub-sdk/version.txt'],
function($, version) {
    'use strict';

    return {
        version: $.trim(version)
    };
});
