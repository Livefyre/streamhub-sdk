var AuthRequiredCommand = require('streamhub-sdk/command/Auth-Required-Command');
var inherits = require('inherits');
var log = require('streamhub-sdk/debug')
        ('streamhub-sdk/upload/command');
var Upload = require('streamhub-sdk/upload');
var Writable = require('stream/writable');

'use strict';

/**
 * @param [fn] {function} Option function to replace the default function.
 * @param [collection] {Collection} The collection for the Upload to pipe to.
 * @param [opts] {Object}
 * @param [opts.upload} {Upload} Upload to use in-place of default construction.
 * @constructor
 * @extends {AuthRequiredCommand}
 */
var UploadCommand = function(fn, collection, opts) {
    var self = this;
    opts = opts || {};
    fn = fn || cmd;
    AuthRequiredCommand.call(this, fn);
    
    opts.upload && (this.upload = opts.upload);
    collection && this.upload.pipe(collection);
    
    function cmd() {
        if (!self.upload) {
            log('this.upload is required to execute this command', this);
            return;
        }
        self.upload.pickAndStore(callback);
    }
    
    function callback(err, data) {
        self.upload.onStore(err, data);
        self.onDone(err, data);
    }
};
inherits(UploadCommand, AuthRequiredCommand);

/**
 * The Upload object utilized by this Command
 * @type {!Upload}
 */
UploadCommand.prototype.upload = new Upload();

/**
 * Executed after pickAndStore
 * @param [err] {?Object=}
 * @param [data] {?Object=}
 */
UploadCommand.prototype.onDone = function (err, data) {
    //Abstract
};

module.exports = UploadCommand;