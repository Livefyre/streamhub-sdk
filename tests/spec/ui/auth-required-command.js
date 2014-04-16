'use strict';

var auth = require('auth');
var MockUserFactory = require('auth-livefyre-tests/mocks/mock-user-factory');
var Auth = require('streamhub-sdk/auth');
var AuthRequiredCommand = require('streamhub-sdk/ui/auth-required-command');
var Command = require('streamhub-sdk/ui/command');
var EventEmitter = require('event-emitter');

describe('AuthRequiredCommand: streamhub-sdk/ui/command/auth-required-command', function () {
    it('is a constructor that subclasses Command', function () {
        expect(typeof(AuthRequiredCommand)).toBe('function');
        var authReqCmd = new AuthRequiredCommand(new Command(function () {}));
        expect(authReqCmd instanceof AuthRequiredCommand).toBe(true);
        expect(authReqCmd instanceof Command).toBe(true);
        expect(authReqCmd instanceof EventEmitter).toBe(true);
    });

    describe('when constructed', function () {
        var authReqCmd;
        var cmd;
        var cmdSpy;
        var observer;
        var mockUserFactory;
        var user;

        beforeEach(function () {
            // Auth mock user
            mockUserFactory = new MockUserFactory();
            user = mockUserFactory.createUser();

            cmdSpy = jasmine.createSpy('command function');
            cmd = new Command(cmdSpy);
            authReqCmd = new AuthRequiredCommand(cmd);
            
            observer = jasmine.createSpy('change:canExecute');
            authReqCmd.on('change:canExecute', observer);

            auth.delegate({
                login: function () {}
            });
            auth.delegate({
                login: function () {},
                logout: function (loggedOut) {
                    loggedOut();
                }
            });
        });
        
        afterEach(function () {
            authReqCmd._listeners && authReqCmd.removeListener('change:canExecute', observer);
            auth.logout();
        });
        
        it('can be .destroy()\'d', function () {
            expect(typeof(authReqCmd.destroy)).toBe('function');
            
            expect(authReqCmd._listeners).not.toBeNull();
            
            authReqCmd.destroy();
            
            expect(authReqCmd._listeners).toBeNull();
        });
        
        it('has a default ._authCmd that is enabled', function () {
            expect(authReqCmd._authCmd).toBeTruthy();
            expect(authReqCmd._authCmd.canExecute()).toBe(true);
        });
        
        it('listens to auth for "authenticate.livefyre" and emits change:canExecute', function () {
            expect(observer).toHaveBeenCalledWith(true);
        });
        
        describe('emits change:canExecute when ', function () {
            it('detects a change in ._authCmd.canExecute()', function () {
                authReqCmd._authCmd.disable();
                expect(observer).toHaveBeenCalled();
            });
            it('detects a change in ._authCmd.canExecute()', function () {
                authReqCmd._authCmd.enable();
                expect(observer).toHaveBeenCalled();
            });
            it('detects a change in the Auth token', function () {
                expect(observer).toHaveBeenCalled();
            });
        });
        
        describe('and is .disable()\'d', function () {
            it('sets ._canExecute === false and emits change:canExecute, false', function () {
                authReqCmd.disable();
                
                expect(cmd.canExecute()).toBe(true);
                expect(authReqCmd._canExecute).toBe(false);
            });
            
            it('sets ._canExecute === true with .enable() and emits change:canExecute, false', function () {
                authReqCmd.disable();
                
                authReqCmd.enable();
                
                expect(cmd.canExecute()).toBe(true);
                expect(authReqCmd._canExecute).toBe(true);
            });
        });
        
        describe('and .canExecute()', function () {
            describe('but user isn\'t authenticated', function () {
                beforeEach(function () {
                    auth.logout();
                });

                it('auth.isAuthenticated() === false', function () {
                    expect(auth.isAuthenticated()).toBe(false);
                });

                describe('and #_canExecute === true', function () {
                    beforeEach(function () {
                        authReqCmd._authCmd.enable();
                    });

                    describe('and #_authCmd.canExecute() === true', function () {
                        it('can execute', function () {
                            authReqCmd._authCmd.enable();
                            expect(authReqCmd._canExecute).toBe(true);
                            expect(authReqCmd.canExecute()).toBe(true);
                        });
                    });

                    describe('and #authCmd.canExecute === false', function () {
                        it('cannot execute', function () {
                            authReqCmd._authCmd.disable();
                            expect(authReqCmd._canExecute).toBe(true);
                            expect(authReqCmd.canExecute()).toBe(false);
                        });
                    });
                });
            });
            
            describe('and user is authenticated', function () {
                beforeEach(function () {
                    auth.login({ livefyre: user});
                });

                it('auth.isAuthenticated() === true', function () {
                    expect(auth.isAuthenticated()).toBe(true);
                });
                
                it('.execute()\'s ._authCmd', function () {
                    expect(authReqCmd.canExecute()).toBe(true);
                    authReqCmd.execute();
                    expect(cmdSpy).toHaveBeenCalled();
                });
            });
        });
    });
});
