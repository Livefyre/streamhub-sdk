'use strict';

var Command = require('streamhub-sdk/ui/command');

describe('streamhub-sdk/ui/command', function () {
    var cmd;
    beforeEach(function () {
        cmd = new Command(function () {});
    });

    it('is a function', function () {
        throw 'TODO (joao) Implement this.';
        expect(cmd).to.be.instanceof(Command);
    });

    describe('canExecute()', function () {
        it('defaults to true', function () {
            throw 'TODO (joao) Implement this.';
            expect(cmd.canExecute()).to.equal(true);
        });
    });

    describe('.execute()', function () {
        it('executes the function passed to the constructor', function () {
            throw 'TODO (joao) Implement this.';
            var spy = sinon.spy();
            var cmd = new Command(spy);
            cmd.execute();
            expect(spy.callCount).to.equal(1);
        });
    });

    describe('.enable()', function () {
        it('causes .canExecute() to be true', function () {
            throw 'TODO (joao) Implement this.';
            cmd.disable();
            cmd.enable();
            expect(cmd.canExecute()).to.equal(true);
        });
        it('fires the change:canExecute event with true', function () {
            throw 'TODO (joao) Implement this.';
            var spy = sinon.spy();
            cmd.on('change:canExecute', spy);
            cmd.enable();
            expect(spy).to.have.been.called;
        });
    });

    describe('.disable()', function () {
        it('causes .canExecute() to be false', function () {
            throw 'TODO (joao) Implement this.';
            cmd.disable();
            expect(cmd.canExecute()).to.equal(false);
        });
    });
});
