define([
    'streamhub-sdk/jquery',
    'text!streamhub-sdk/version.txt',
    'streamhub-sdk/collection',
    'streamhub-sdk/content',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-sdk/views/list-view'],
function($, version, Collection, Content, ContentListView, ListView) {
    'use strict';

    return {
        version: $.trim(version),
        Collection: Collection,
        Content: Content,
        ContentListView: ContentListView,
        ListView: ListView
    };
});
