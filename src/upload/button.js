var Button = require('streamhub-sdk/views/button');
var Command = require('streamhub-sdk/command');
var inherits = require('inherits');
var UploadCommand = require('streamhub-sdk/upload/command');

'use strict';

/**
 * @param [command] {function||Command} Collection not necessary if this is provided.
 * @param [collection] {Collection} Must be specified here or as opts.collection.
 * @param [opts] {Object}
 * @param [opts.collection] {Collection} Must be specified here or the collection parameter.
 * @constructor
 * @extends {Button}
 */
var UploadButton = function(command, collection, opts) {
    opts = opts || {};
    collection = collection || opts.collection;
    if (!collection && !command) {
    //A collection must be specified unless the user specifies their own command
        throw 'Attempting to create an UploadButton without specifying a collection or a command.';
    }
    
    if (typeof(command) === 'function') {
    //Pass a function to the default command
        command = new UploadCommand(command, collection, opts);
    }
    command = command || new UploadCommand(null, collection, opts);
    Button.call(this, command, opts);
};
inherits(UploadButton, Button);

/**
 * @override
 * @type {string}
 */
UploadButton.prototype.elClass += ' lf-upload-btn';

module.exports = UploadButton;