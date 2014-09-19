define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/storage',
    'streamhub-sdk/content'],
function ($, Storage, Content) {
    'use strict';

    describe('Storage', function () {
        var contentA,
            contentB,
            onSpy,
            storage;
        beforeEach(function () {
            storage = new Storage();
            storage.cache = {};
            contentA = new Content("Body A");
            contentB = new Content("Body B");
            onSpy = jasmine.createSpy('event handler');
        });
        
        describe(".set", function () {
            
            beforeEach(function () {
                
            });
            
            it("adds new contents and emits 'add'", function () {
                storage.on('add', onSpy);
                
                storage.set(contentA.id, contentA);
                
                expect(storage.cache[contentA.id]).toEqual(contentA);
                expect(onSpy).toHaveBeenCalledWith(contentA);
            });

            it("updates existing contents and emits 'change'", function () {
                storage.on('change', onSpy);
                
                storage.set(contentA.id, contentA);
                storage.set(contentA.id, contentB);
                
                expect(storage.cache[contentA.id]).toEqual(contentB);
                expect(onSpy).toHaveBeenCalledWith(contentA, contentB);
            });
            
            it("returns content", function () {
                var val = storage.set('key', contentA);
                
                expect(val).toEqual(contentA);
            });
            
            it("executes callback when provided", function () {
                var spy = jasmine.createSpy('callback');
                
                storage.set('key', contentA, spy);
                
                expect(spy).toHaveBeenCalledWith(contentA);
            });
        });
        
        describe(".get", function () {
            var key;
            beforeEach(function () {
                key = contentA.id;
                storage.cache[key] = contentA;
            });
            
            it("returns content", function () {
                var val = storage.get(key);
                
                expect(val).toEqual(contentA);
            });
            
            it("returns undefined when there is no data for that key", function () {
                var val = storage.get('fake key');
                
                expect(val).not.toBeDefined();
            });
            
            it("executes callback when provided", function () {
                var spy = jasmine.createSpy('callback');
                storage.get(key, spy);
                
                expect(spy).toHaveBeenCalledWith(contentA);
            });
        });
    });
});
