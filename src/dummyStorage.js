define([], function() {
    'use strict';

    var DummyStorage = function(){};
    DummyStorage.prototype.get = function() {};
    DummyStorage.prototype.set = function() {};
    DummyStorage.prototype.on = function() {};
    DummyStorage.prototype.once = function() {};
    DummyStorage.prototype.addListener = function() {};
    DummyStorage.prototype.removeListener = function() {};
    DummyStorage.prototype.emit = function() {};

    return DummyStorage;
});
