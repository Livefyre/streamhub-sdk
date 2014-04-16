'use strict';

var Command = require('streamhub-sdk/ui/command');
var EventEmitter = require('event-emitter');

describe('streamhub-sdk/ui/command', function () {
    it('is a constructor and subclass of EventEmitter', function () {
        expect(typeof(Command)).toBe('function');
        var cmd = new Command(function () {});
        expect(cmd instanceof Command).toBe(true);
        expect(cmd instanceof EventEmitter).toBe(true);
    });
    
    it('can\'t be constructed without a specified function', function () {
        expect(function () {
            new Command();
        }).toThrow();
    });
    
    describe('when constructed', function () {
        var cmd;
        var fn;
        beforeEach(function () {
            fn = jasmine.createSpy('command function');
            cmd = new Command(fn);
        });
        
        it('.canExecute() by default', function () {
            expect(cmd.canExecute()).toBe(true);
        });
        
        it('.execute()s the function passed to the constructor', function () {
            cmd.execute();
            expect(fn).toHaveBeenCalled();
        });
        
        it('can be .disable()\'d and emits change:canExecute, false', function () {
            var spy = jasmine.createSpy('change:canExecute');
            cmd.on('change:canExecute', spy);
            cmd.disable();
            
            expect(cmd.canExecute()).toBe(false);
            expect(spy).toHaveBeenCalledWith(false);
        });
        
        describe('and disabled', function () {
            beforeEach(function () {
                cmd.disable();
            });
            
            it('.canExecute() is false', function () {
                expect(cmd.canExecute()).toBe(false);
            });
            
            it('can\'t .execute()', function () {
                cmd.execute();
                expect(fn).not.toHaveBeenCalled();
            });
            
            it('can be .enable()\'d and emits change:canExecute, true', function () {
                var spy = jasmine.createSpy('change:canExecute');
                cmd.on('change:canExecute', spy);
                cmd.enable();
                
                expect(cmd.canExecute()).toBe(true);
                expect(spy).toHaveBeenCalledWith(true);
            });
        });
        
        describe('with opts', function () {
            var opts;
            beforeEach(function () {
                opts = {
                    enable: false
                };
                cmd = new Command(fn, opts);
            });
            
            it('is disabled for enable: false', function () {
                expect(cmd.canExecute()).toBe(false);
            });
        });
    });
});
