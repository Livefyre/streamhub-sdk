define([], function() {
    'use strict';

    var MockStorage = function(){};
    MockStorage.prototype.get = function() {};
    MockStorage.prototype.set = function() {};
    MockStorage.prototype.on = function() {};
    MockStorage.prototype.once = function() {};
    MockStorage.prototype.addListener = function() {};
    MockStorage.prototype.removeListener = function() {};
    MockStorage.prototype.emit = function() {};

    return MockStorage;
});
