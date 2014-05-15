var Content = require('streamhub-sdk/content');
var LivefyreContentClient = require('streamhub-sdk/content/clients/content-client');
var StateToContent = require('streamhub-sdk/content/state-to-content');

'use strict';

/**
 * 
 * @param opts {!object}
 * @param opts.network {!string}
 * @param opts.collectionId {!string}
 * @param opts.contentId {!string}
 * @param [opts.environment] {string=}
 * @param [opts.replies] {boolean=} Default is true.
 * @param [opts.depthOnly] {boolean=} Default is false.
 * @param [opts.contentClient] {ContentClient=} HTTP Client
 * @param [opts.stateToContent] {function} Constructor for StateToContent
 * @param callback {!function(err: Object, data: Content)}
 */
var fetchContent = function (opts, callback) {
    if (!opts) {
        throw 'Can\'t fetchContent() without specifying opts';
    }
    if (!opts.collectionId || !opts.network || !opts.contentId) {
        throw 'Can\'t fetchContent() without network, collectionId and contentId';
    }
    if (!callback) {
        throw 'Can\'t fetchContent() without specifying a callback';
    }
    //build opts for content client and state to content
    opts.replies = !!opts.replies;
    opts.depthOnly = opts.depthOnly || false;

    //Send the request
    var contentClient = opts.contentClient || new LivefyreContentClient();
    contentClient.getContent(opts, processStates);
    
    function processStates(err, data) {
        if (err) {
            callback(err);
            return;
        }
        
        var states = data.content || [],
            state,
            content,
            contents = [];
        
        //Prepare StateToContents to handle the received states
        opts.authors = data.authors;
        var transConstructor = opts.stateToContent || StateToContent;
        var trans = new transConstructor(opts);
        
        //Listen for states that have been transformed into Content
        trans.on('data', function (content) {
            contents.push(content);
        });
        
        trans.once('end', function () {
            //Once trans has processed everything, find the desired Content
            //and send it to the callback.
            for (var i=0; i < contents.length; i++) {
                if (contents[i] && contents[i].id === opts.contentId) {//Must be strings
                    callback(undefined, contents[i]);
                    return;
                }
            }
            
            //If we get here, something went very wrong.
            callback('ERROR');
        });

        //Write each state into StateToContent
        for (var i=0, statesCount=states.length; i < statesCount; i++) {
            state = states[i];
            trans.write(state);
        }
        trans.end();
    }
};

module.exports = fetchContent;
