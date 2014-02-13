'use strict';

var View = require('view');
var Command = require('streamhub-sdk/ui/command');
var Button = require('streamhub-sdk/ui/button');

describe('streamhub-sdk/ui/button', function () {
    it('is a constructor that subclasses View', function () {
        expect(typeof(Button)).toBe('function');
        var button = new Button();
        expect(button instanceof Button).toBe(true);
        expect(button instanceof View).toBe(true);
    });

    it('can be constructed without a command', function () {
        expect(function () {
            new Button();
        }).not.toThrow();
    });
    
    it('can be constructed with a command', function () {
        var button;
        var cmd;
        expect(function () {
            cmd = new Command(function () {});
            button = new Button(cmd);
        }).not.toThrow();
        expect(button._command).toBe(cmd);
    });
    
    describe('when constructed with a command', function () {
        var button;
        var cmd;
        beforeEach(function () {
            cmd = new Command(jasmine.createSpy('Command'));
            button = new Button(cmd);
        });
        
        it('executes the command when clicked', function () {
            button.$el.click();
            expect(cmd._execute).toHaveBeenCalled();
        });
        
        it('uses .disabledClass to reflect Command.disable/enable', function () {
            // enabled by default
            expect(button.$el.hasClass(button.disabledClass)).toBe(false);
            
            // reflects disabling
            cmd.disable();
            expect(button.$el.hasClass(button.disabledClass)).toBe(true);
            
            // reflects re-enabling
            cmd.enable();
            expect(button.$el.hasClass(button.disabledClass)).toBe(false);
        });
    });
});
