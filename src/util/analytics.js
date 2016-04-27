var LivefyreContent = require('streamhub-sdk/content/types/livefyre-content');

'use strict';

module.exports = {};

/**
 * Valid attributes for an oembed entity.
 * @type {Array.<string>}
 */
var validOembedAttributes = [
    'author_name',
    'author_url',
    'cache_age',
    'html',
    'provider_name',
    'provider_url',
    'thumbnail_height',
    'thumbnail_url',
    'thumbnail_width',
    'title',
    'type',
    'url',
    'version'
];

/**
 * Create a content object entity from a Content model.
 * @param {Content} model - The model to build the content entity from.
 * @return {Object}
 */
module.exports.contentObjectEntityFromModel = function (model) {
    var content = (model.meta || {}).content || {};
    var entity = {
        type: 'Content',
        id: model.id,
        contentGenerator: (content.generator || {}).id || 'livefyre.com'
    };

    if (model instanceof LivefyreContent) {
        entity.isFeatured = model.isFeatured();
    } else {
        entity.isFeatured = !!(content.annotations || {}).featuredmessage;
    }

    if (model.parentId) {
        entity.inReplyTo = model.parentId;
    }
    if (model.attachments && model.attachments.length) {
        entity.attachment = model.attachments;
    }
    return entity;
};

/**
 * Create an oembed object entity from an Oembed model.
 * @param {Oembed} model - The model to build the oembed entity from.
 * @return {Object}
 */
module.exports.oembedObjectEntityFromModel = function (model) {
    var entity = {};
    var value;

    validOembedAttributes.forEach(function (attr) {
        value = model[attr];
        if (value === undefined || value === null) {
            return;
        }
        entity[attr] = value;
    });

    if (entity.url || model.link) {
        entity.url = entity.url || model.link;
    }
    entity.version = entity.version || '1.0';
    return entity;
};
