'use strict';

var Auth = require('streamhub-sdk/auth');
var AuthReqCommand = require('streamhub-sdk/ui/auth-required-command');
var Command = require('streamhub-sdk/ui/command');
var EventEmitter = require('event-emitter');

describe('streamhub-sdk/ui/command/auth-required-command', function () {
    it('is a constructor that subclasses Command', function () {
        expect(typeof(AuthReqCommand)).toBe('function');
        var authReqCmd = new AuthReqCommand(new Command(function () {}));
        expect(authReqCmd instanceof AuthReqCommand).toBe(true);
        expect(authReqCmd instanceof Command).toBe(true);
        expect(authReqCmd instanceof EventEmitter).toBe(true);
    });
    
    it('can\'t be constructed without a specified command', function () {
        expect(function () {
            new AuthReqCommand();
        }).toThrow();
        expect(function () {
            new AuthReqCommand(function () {});
        }).toThrow();
    });
    
    describe('when constructed', function () {
        var authCmd;
        var authCmdSpy;
        var authReqCmd;
        var cmd;
        var cmdSpy;
        var observer;
        beforeEach(function () {
            cmdSpy = jasmine.createSpy('command function');
            cmd = new Command(cmdSpy);
            authReqCmd = new AuthReqCommand(cmd);
            observer = jasmine.createSpy('change:canExecute');
            authReqCmd.on('change:canExecute', observer);
            
            authCmdSpy = jasmine.createSpy('authentication command function')
                .andCallFake(function (callback) {
                    Auth.setToken('TOKENZ');
                    callback();
                });
            authCmd = new Command(authCmdSpy);
        });
        
        afterEach(function () {
            Auth.setToken('');
            authReqCmd._listeners && authReqCmd.removeListener('change:canExecute', observer);
        });
        
        it('can be .destroy()\'d', function () {
            expect(typeof(authReqCmd.destroy)).toBe('function');
            
            expect(authReqCmd._authCmd).not.toBeNull();
            expect(authReqCmd._command).not.toBeNull();
            expect(authReqCmd._execute).not.toBeNull();
            expect(authReqCmd._listeners).not.toBeNull();
            
            authReqCmd.destroy();
            
            expect(authReqCmd._authCmd).toBeNull();
            expect(authReqCmd._command).toBeNull();
            expect(authReqCmd._execute).toBeNull();
            expect(authReqCmd._listeners).toBeNull();
        });
        
        it('has a default ._authCmd that is disabled', function () {
            expect(authReqCmd._authCmd).toBeTruthy();
            expect(authReqCmd._authCmd.canExecute()).toBe(false);
        });
        
        it('can .setAuthCommand()', function () {
            authReqCmd.setAuthCommand(authCmd);
            expect(authReqCmd._authCmd).toBe(authCmd);
        });
        
        it('listens to Auth for "token" and emits change:canExecute', function () {
            Auth.setToken('TOKENZ');
            expect(observer).toHaveBeenCalledWith(true);
        });
        
        describe('emits change:canExecute when ', function () {
            it('detects a change in ._command.canExecute()', function () {
                authReqCmd._command.disable();
                expect(observer).toHaveBeenCalled();
            });
            it('detects a change in ._authCmd.canExecute()', function () {
                authReqCmd._authCmd.enable();
                expect(observer).toHaveBeenCalled();
            });
            it('detects a change in the Auth token', function () {
                Auth.setToken('TOKENZ');
                expect(observer).toHaveBeenCalled();
            });
        });
        
        describe('and is .disable()\'d', function () {
            it('disables ._command and emits change:canExecute, false', function () {
                authReqCmd.disable();
                
                expect(cmd.canExecute()).toBe(false);
                expect(authReqCmd.canExecute()).toBe(false);
            });
            
            it('can re-enable ._command with .enable() and emits change:canExecute, false', function () {
                authReqCmd.disable();
                
                authReqCmd.enable();
                
                expect(cmd.canExecute()).toBe(true);
//                debugger
                expect(authReqCmd.canExecute()).toBe(Boolean(Auth.getToken() || authReqCmd._authCmd.canExecute()));
            });
        });
        
        describe('and ._command.canExecute()', function () {
            describe('but user isn\'t authenticated', function () {
                beforeEach(function () {
                    authReqCmd.setAuthCommand(authCmd);
                });
                
                describe('and the ._authCmd.canExecute()', function () {
                    it('executes ._authCmd, passing a function to invoke on succes', function () {
                        authReqCmd.execute();
                        expect(authCmdSpy).toHaveBeenCalled();
                        expect(cmdSpy).toHaveBeenCalled();
                    });
                    
                });
                
                describe('and the ._authCmd can\'t execute()', function () {
                    beforeEach(function () {
                        authCmd.disable();
                    });
                    
                    it('can\'t .execute()', function () {
                        expect(authReqCmd.canExecute()).toBe(false);
                        authReqCmd.execute();
                        expect(cmdSpy).not.toHaveBeenCalled();
                    });
                });
            });
            
            describe('and user is authenticated', function () {
                beforeEach(function () {
                    Auth.setToken('TOKENZ');
                });
                
                it('.execute()s ._command', function () {
                    expect(authReqCmd.canExecute()).toBe(true);
                    authReqCmd.execute();
                    expect(cmdSpy).toHaveBeenCalled();
                });
            });
        });
        
        describe('with opts', function () {
            var opts;
            var cmd;
            beforeEach(function () {
                cmd = new Command(function () {});
                opts = {
                    authCmd: cmd
                };
            });
            
            it('passes opts.authCmd to .setAuthCommand()', function () {
                var authReqCmd = new AuthReqCommand(
                        new Command(function () {}),
                        opts);
                expect(authReqCmd._authCmd).toBe(cmd);
            });
        });
    });
});
