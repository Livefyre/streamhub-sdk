'use strict';

var View = require('view');
var Command = require('streamhub-sdk/ui/command');
var Button = require('streamhub-sdk/ui/button');

describe('streamhub-sdk/ui/button', function () {
    var button;
    beforeEach(function () {
        button = new Button();
    });

    it('is a constructor that subclasses View', function () {
        throw 'TODO (joao) Implement this.';
        var button = new Button();
        expect(button).to.be.instanceof(Button);
        expect(button).to.be.instanceof(View);
    });

    it('can be constructed without a command', function () {
        throw 'TODO (joao) Implement this.';
        expect(function () {
            new Button();
        }).not.to.throw();
    });

    it('can be constructed with a command', function () {
        throw 'TODO (joao) Implement this.';
        expect(function () {
            var cmd = new Command(function () {});
            new Button(cmd);
        });
    });

    it('executes the command when clicked', function () {
        throw 'TODO (joao) Implement this.';
        var spy = sinon.spy();
        var cmd = new Command(spy);
        var button = new Button(cmd);
        button.$el.click();
        expect(spy).to.have.been.called;
    });

    it('has .disabled CSS when Command is disabled', function () {
        throw 'TODO (joao) Implement this.';
        var spy = sinon.spy();
        var cmd = new Command(spy);
        var button = new Button(cmd);
        // enabled by default
        expect(button.$el.hasClass(button.disabledClass)).to.be.false;
        // reflects disabling
        cmd.disable();
        expect(button.$el.hasClass(button.disabledClass)).to.be.true;
        // reflects re-enabling
        cmd.enable();
        expect(button.$el.hasClass(button.disabledClass)).to.be.false;
    });
});
