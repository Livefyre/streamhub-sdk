var $ = require('jquery');
var inherits = require('inherits');
var Content = require('streamhub-sdk/content');
var ModalView = require('streamhub-sdk/modal');
var Readable = require('stream/readable');
var Util = require('streamhub-sdk/util');
var View = require('streamhub-sdk/view');

'use strict';

/**
 * The reference to window.filepicker is stored here once loaded.
 * @private
 */
var _picker = null;

/**
 * A view that handles the display of and data returned by FilePicker.
 * Parasitically inherits from Readable, allowing it to pipe returned data
 * to a Writable.
 * @param [key] {string} API key to use with FilePicker.io
 * @param [opts] {Object}
 * @param [opts.api] {{key: !string, cache: !string}} If you intend to use
 *      a different api key, you will also need to provide the cache url.
 * @param [opts.name] {string} Assigned to provider_name for returned data
 * @param [doc] {Element} Document element to render within
 * @constructor
 * @extends {View}
 */
var Upload = function(opts, doc) {
    opts = opts || Upload.DEFAULT_OPTS;
    View.call(this, opts);
    Readable.call(this, opts);

    if (opts.api) {
        this._apiKey = opts.api.key;
        this._cacheUrl = opts.api.cache;
    }
    this.name = opts.name || this.name;
    this.opts = opts;
    
    var src = this.opts.src;
    
    this.render();
    this._modal = new ModalView({
        modalSubView: this
    });
    
    if (_picker) {
        return this;
    }
    
    $.getScript(src, scriptLoadCallback);
    
    var self = this;
    function scriptLoadCallback(script, status, data) {
        if (status !== 'success') {
            _picker = false;
            throw 'There was an error loading ' + src;
        }

        _picker = filepicker;
        _picker.setKey(self._apiKey);
    }
};
inherits(Upload, View);
inherits.parasitically(Upload, Readable);

/**
 * Some implementation is required by the abstract Readable.
 * @override
 * @protected
 */
Upload.prototype._read = function() {};

/**
 * privider_name attribute assigned to written data
 * @type {!string}
 */
Upload.prototype.name = 'StreamhubUpload';

/**
 * Class to be added to the view's element.
 * @type {!string}
 */
Upload.prototype.class = ' upload';

/**
 * The default element tag.
 * @override
 * @type {!string}
 */
Upload.prototype.elTag = 'iframe';

/**
 * Template for el
 * @override
 * @param [context] {Object}
 */
Upload.prototype.template = function (context) {
    return ['<iframe id="',
            context.container,
            '" style="width:560px;height:432px;"',
            '></iframe>'].join('');
};

/**
 * Get contextual data for a template.
 * @override
 * @returns {!Object}
 */
Upload.prototype.getTemplateContext = function () {
    return {
        container: this.opts.pick.container
    };
};

/**
 * If a template is set, render it in this.el
 * Subclasses will want to setElement on child views after rendering,
 *     then call .render() on those sub-elements
 */
Upload.prototype.render = function () {
    var context;
    if (typeof this.template === 'function') {
        context = this.getTemplateContext();
        this.$el.html(this.template(context));
    }
};

/**
 * Key for FilePicker API.
 * @type {!string}
 * @private
 */
Upload.prototype._apiKey = 'AtvGm2B6RR9mDKb8bImIHz';

/**
 * The URL where uploads are cached
 * @type {!string}
 * @private
 */
Upload.prototype._cacheUrl = 'http://dazfoe7f6de09.cloudfront.net/';

/**
 * The default options for using FilePicker and pickAndStore
 * @type {!Object}
 */
Upload.DEFAULT_OPTS = {
    pick: {
        'container': 'picker',
        'maxSize': 4*1024*1024, // allows files < 4MB
        'mimetypes': ['image/*'],
        'multiple': true,
        'services': ['COMPUTER', 'WEBCAM', 'IMAGE_SEARCH', 'FACEBOOK', 'INSTAGRAM', 'FLICKR', 'PICASA', 'BOX', 'DROPBOX', 'GOOGLE_DRIVE']
    },
    store: {
        'location': 'S3',
        'access': 'public'
    },
    src: '//api.filepicker.io/v1/filepicker.js'
};

/**
 * Default callback to pickAndStore()
 * @param [err] {Object}
 * @param [inkBlob] {Object}
 */
Upload.prototype.onStore = function (err, inkBlob) {
    if (err) {
        if (err.code !== 101) {//101 when dialog closed using x-box.
            throw 'There was an error storing the file.';
        }
        return;
    }
    
    var contentToWrite = new Content({
        body: ''
    });
    inkBlob && inkBlob.forEach(function (blob) {
        var url = this._cacheUrl + blob.key;
        contentToWrite.attachments.push({
            type: 'photo',
            url: url,
            link: url,
            provider_name: this.name
        });
    }, this);
    
    this.push(contentToWrite);
};

/**
 * Displays FilePicker view for uploading objects. Data is passed to the callback.
 * @param [callback] {function(Object, Object)} Optional. Default is this.onStore
 */
Upload.prototype.pickAndStore = function(callback) {
    if (_picker === false) {
        throw 'The FilePicker script failed to load correctly.';
    }
    
    if (_picker === null) {
    //Hasn't loaded yet
        //TODO (joao) Test this
        debugger
        setTimeout(function() {
            this.pickAndStore(callback);
        }.bind(this), 150);
        return;
    }
    
    callback = callback || this.onStore;
    var successFn = function(inkBlob) {
        //BUG (joao) Can't scroll page after posting pic.
        this._modal.hide();
        callback.call(this, undefined, inkBlob);
    }.bind(this);
    var errorFn = function(error) {
        this._modal.hide();
        callback.call(this, error);
    }.bind(this);
    
    this._modal.show();
    _picker.pickAndStore(this.opts.pick, this.opts.store, successFn, errorFn);
};

module.exports = Upload;