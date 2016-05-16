define([
    'jquery',
    'auth',
    'livefyre-auth',
    'livefyre-auth/livefyre-auth-delegate',
    'livefyre-auth-tests/mocks/mock-user-factory',
    'json!livefyre-auth-tests/mocks/auth-response.json',
    'streamhub-sdk/util',
    'streamhub-sdk/content',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-twitter-content',
    'streamhub-sdk/content/types/livefyre-opine',
    'streamhub-sdk/content/views/livefyre-content-view',
    'streamhub-sdk/content/content-view-factory',
    'streamhub-sdk/collection/liker',
    'streamhub-sdk/ui/button',
    'streamhub-sdk/ui/command',
    'streamhub-sdk/sharer'],
function (
    $,
    auth,
    authLivefyre,
    livefyreAuthDelegate,
    MockUserFactory,
    mockAuthResponse,
    util,
    Content,
    LivefyreContent,
    LivefyreTwitterContent,
    LivefyreOpine,
    LivefyreContentView,
    ContentViewFactory,
    Liker,
    Button,
    Command,
    sharer) {
    'use strict';

    describe('LivefyreContentView', function () {

        describe('Buttons (footer)', function () {
            var contentView;

            beforeEach(function () {
                contentView = new LivefyreContentView({
                    content: new Content('blah')
                });
            });

            it('can add a button before render', function () {
                var initialCount = contentView._footerView._controls.left.length;
                var button = new Button();
                contentView.addButton(button);
                contentView.render();
                expect(contentView._footerView._controls.left.length).toBe(initialCount+1);
                expect(contentView.$('.lf-btn').length).toBe(1);
            });

            it('can add a button after render', function () {
                var initialCount = contentView._footerView._controls.left.length;
                var button = new Button();
                contentView.render();
                contentView.addButton(button);
                expect(contentView._footerView._controls.left.length).toBe(initialCount+1);
                expect(contentView.$('.lf-btn').length).toBe(1);
            });

            it('can remove a button', function () {
                var initialCount = contentView._footerView._controls.left.length;
                var button = new Button();
                contentView.addButton(button);
                expect(contentView._footerView._controls.left.length).toBe(initialCount+1);
                contentView.removeButton(button);
                expect(contentView._footerView._controls.left.length).toBe(initialCount);
            });
        });

        describe('Like button', function () {

            var mockUserFactory,
                user,
                contentViewFactory;

            beforeEach(function () {
                // Auth mock user
                mockUserFactory = new MockUserFactory();
                user = mockUserFactory.createUser();
                auth.delegate({
                    login: function (done) { done(); },
                    logout: function (done) { done(); }
                });
                auth.login({ livefyre: user});
                contentViewFactory = new ContentViewFactory();
            });

            afterEach(function () {
                auth.logout();
            });

            it("only renders for non-Twitter content items", function () {
                var twitterContent = new LivefyreTwitterContent({
                    id: 'tweet-1234@twitter.com',
                    body: 'tweet i am',
                    author: {
                        id: 'jimmy@twitter.com'
                    }
                });
                var twitterContentView = contentViewFactory.createContentView(twitterContent, {
                    liker: new Liker()
                });
                twitterContentView.render();

                expect(twitterContentView.$el.find('.hub-content-like')).toHaveLength(0);

                var lfContent = new LivefyreContent({ body: 'lf content', id: '1' });
                var lfContentView = contentViewFactory.createContentView(lfContent, {
                    liker: new Liker()
                });
                lfContentView.render();

                expect(lfContentView.$el.find('.hub-content-like')).toHaveLength(1);
            });

            it("is in the toggle off state when not liked by authenticated user", function () {
                var lfContent = new LivefyreContent({ body: 'lf content', id: '1' });
                var lfContentView = contentViewFactory.createContentView(lfContent, {
                    liker: new Liker()
                });
                lfContentView.render();

                expect(lfContentView.$el.find('.hub-btn-toggle-off')).toHaveLength(1);
            });

            it("is in the toggle on state when liked by authenticated user", function () {
                var lfContent = new LivefyreContent({ body: 'lf content', id: '1' });
                var lfOpine = new LivefyreOpine({
                    type: 1,
                    vis: 1,
                    author: { id: mockAuthResponse.data.profile.id }
                });
                lfContent.addOpine(lfOpine);
                var lfContentView = contentViewFactory.createContentView(lfContent, {
                    liker: new Liker()
                });
                lfContentView.render();

                expect(lfContentView.$el.find('.hub-btn-toggle-on')).toHaveLength(1);
            });

            it("updates the label when a 'opine' event is emitted on the associated content", function () {
                var lfContent = new LivefyreContent({ body: 'lf content', id: '1' });
                var lfContentView = contentViewFactory.createContentView(lfContent, {
                    liker: new Liker()
                });
                lfContentView.render();

                spyOn(lfContentView._likeButton, '_updateLikeCount');

                // Add like
                var lfOpine = new LivefyreOpine({
                    type: 1,
                    vis: 1,
                    author: { id: mockAuthResponse.data.profile.id }
                });
                lfContent.addOpine(lfOpine);

                expect(lfContentView._likeButton._updateLikeCount).toHaveBeenCalled();
            });

            it("updates the label when a 'removeOpine' event is emitted on the associated content", function () {
                var lfContent = new LivefyreContent({ body: 'lf content', id: '1' });
                var lfContentView = contentViewFactory.createContentView(lfContent, {
                    liker: new Liker()
                });
                lfContentView.render();

                // Add like
                var lfOpine = new LivefyreOpine({
                    id: 'blah',
                    type: 1,
                    vis: 1,
                    author: { id: mockAuthResponse.data.profile.id }
                });
                lfContent.addOpine(lfOpine);

                spyOn(lfContentView._likeButton, '_updateLikeCount');

                // Remove like
                lfContent.removeOpine(lfOpine);

                expect(lfContentView._likeButton._updateLikeCount).toHaveBeenCalled();
            });

            it("auto-increments the label when Like button is clicked", function () {
                var lfContent = new LivefyreContent({ body: 'lf content', id: '1' });
                var liker = new Liker();
                var lfContentView = contentViewFactory.createContentView(lfContent, {
                    liker: liker
                });
                lfContentView.render();

                spyOn(liker, 'like');
                spyOn(lfContentView._likeButton, '_handleClick').andCallThrough();

                lfContentView._likeButton.$el.click();
                expect(lfContentView._likeButton._handleClick).toHaveBeenCalled();
                expect(lfContentView._likeButton._label).toBe(1);
            });

            it("reverts label when the Like request errors", function () {
                var lfContent = new LivefyreContent({ body: 'lf content', id: '1' });
                var liker = new Liker();
                var lfContentView = contentViewFactory.createContentView(lfContent, {
                    liker: liker
                });
                lfContentView.render();

                spyOn(liker._writeClient, 'like').andCallFake(function (opts, callback) {
                    callback('error');
                });
                spyOn(liker, 'like').andCallFake(function (content, callback) {
                    this._writeClient.like({}, callback);
                });

                lfContentView._likeButton.$el.click();
                expect(lfContentView._likeButton._label).toBe(0);
            });

            it("cannot execute when the Like button's associated content is authored by the authenticated user (cannot Like own content)", function () {
                var lfContent = new LivefyreContent({
                    body: 'lf content',
                    author: { id: mockAuthResponse.data.profile.id },
                    id: '1'
                });

                // Add like
                var lfOpine = new LivefyreOpine({
                    type: 1,
                    vis: 1,
                    author: { id: mockAuthResponse.data.profile.id }
                });
                lfContent.addOpine(lfOpine);

                var lfContentView = contentViewFactory.createContentView(lfContent, {
                    liker: new Liker()
                });
                lfContentView.render();

                expect(lfContentView._commands.like._canExecute).toBe(false);
            });

            it("can execute when the Like button's associated content is not authored by the authenticated user (can Like other users' content)", function () {
                var lfContent = new LivefyreContent({
                    body: 'lf content',
                    author: { id: 'datdude@blah' },
                    id: '1'
                });

                // Add like
                var lfOpine = new LivefyreOpine({
                    type: 1,
                    vis: 1,
                    author: { id: mockAuthResponse.data.profile.id }
                });
                lfContent.addOpine(lfOpine);

                var lfContentView = contentViewFactory.createContentView(lfContent, {
                    liker: new Liker()
                });
                lfContentView.render();

                expect(lfContentView._commands.like._canExecute).toBe(true);
            });
        });

        describe('Expand button', function () {
            it("renders only if showExpandButton is set to true", function () {
                var contentViewFactory = new ContentViewFactory({showExpandButton: true});
                var lfContent = new LivefyreContent({ body: 'lf content', id: '1' });
                var lfContentView = contentViewFactory.createContentView(lfContent);
                lfContentView.render();
                expect(lfContentView.$el.find('.hub-content-action-expand')).toHaveLength(1);
            });
            it("does not render if showExpandButton is not set", function () {
                var contentViewFactory = new ContentViewFactory();
                var contentViewFactory1 = new ContentViewFactory({showExpandButton: false});
                var lfContent = new LivefyreContent({ body: 'lf content', id: '1' });
                var lfContentView = contentViewFactory.createContentView(lfContent);
                lfContentView.render();
                var lfContentView1 = contentViewFactory1.createContentView(lfContent);
                lfContentView1.render();
                expect(lfContentView.$el.find('.hub-content-action-expand')).toHaveLength(0);
                expect(lfContentView1.$el.find('.hub-content-action-expand')).toHaveLength(0);
            });
            it("expects contenView._expandButton to be definded", function () {
                var contentViewFactory = new ContentViewFactory({showExpandButton: true});
                var lfContent = new LivefyreContent({ body: 'lf content', id: '1'  });
                var lfContentView = contentViewFactory.createContentView(lfContent);
                lfContentView.render();
                expect(lfContentView._expandButton).toBeDefined();
            });
        });

        describe('opts.shareCommand', function () {
            var shareButtonSelector = '.hub-content-share';
            function getShareEl(contentView) {
                return contentView.$el.find(shareButtonSelector);
            }
            function hasShareButton(contentView) {
                return Boolean(getShareEl(contentView).length);
            }
            function contentViewWithShareCommand(shareCommand) {
                return new LivefyreContentView({
                    content: new LivefyreContent(),
                    shareCommand: shareCommand
                });
            }
            function createCommand(onExecute) {
                return new Command(onExecute || function () {});
            }

            it('share button appears when sharer delegate is undefined', function () {
                expect(sharer.hasDelegate()).toBe(false);
                var contentView = new LivefyreContentView({
                    content: new Content('blah')
                });
                contentView.render();
                expect(hasShareButton(contentView)).toBe(true);
            });
            it('share button appears if passed and canExecute and share delegate is set', function () {
                var command = createCommand();
                command.canExecute = function () { return true; };
                var contentView = contentViewWithShareCommand(command);
                contentView.render();
                expect(hasShareButton(contentView)).toBe(true);
            });
            it('share button does not appear if passed and not canExecute', function () {
                var command = createCommand();
                command.canExecute = function () { return false; };
                var contentView = contentViewWithShareCommand(command);
                contentView.render();
                expect(hasShareButton(contentView)).toBe(false);
            });
            it('is executed when the share button is clicked', function () {
                var execute = jasmine.createSpy();
                var command = createCommand(execute);
                command.canExecute = function () { return true; };
                var contentView = contentViewWithShareCommand(command);
                contentView.render();
                expect(hasShareButton(contentView)).toBe(true);
                // Click the button
                getShareEl(contentView).click();
                expect(execute).toHaveBeenCalled();
            });
            // (from bengo) This is disabled because it's currently a rare/weird case.
            // and doesn't work. But we may want it someday.
            // But it will take some refactoringish stuff to ContentView
            xit('shows the button once the command becomes executable', function () {
                var execute = jasmine.createSpy();
                var command = createCommand(execute);
                command.disable();
                var contentView = contentViewWithShareCommand(command);
                contentView.render();
                expect(hasShareButton(contentView)).toBe(false);
                // now enable it
                command.enable();
                expect(hasShareButton(contentView)).toBe(true);
            });
        });

    });
});
