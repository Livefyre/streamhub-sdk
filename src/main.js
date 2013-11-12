var $ = require('streamhub-sdk/jquery');
var version = require('text!streamhub-sdk/version.txt');

exports.version = $.trim(version);