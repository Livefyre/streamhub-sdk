define([
    'jquery',
    'jasmine',
    'jasmine-jquery',
    'streamhub-sdk/content/content',
    'streamhub-sdk/content/views/tiled-attachment-list-view',
    'streamhub-sdk/content/views/oembed-view'],
function($, jasmine, jasminejQuery, Content, TiledAttachmentListView, OembedView) {

    describe('TiledAttachmentListView', function () {
        var oembedAttachment = {
            provider_name: "Twimg",
            provider_url: "http://pbs.twimg.com",
            type: "photo",
            url: "http://pbs.twimg.com/media/BQGNgs9CEAEhmEF.jpg"
        };
        var content = new Content({ body: 'what' });

        describe('when constructed', function() {

            describe('with no arguments or options', function() {
                var tiledAttachmentListView = new TiledAttachmentListView();
                it('is instance of TiledAttachmentListView', function() {
                    expect(tiledAttachmentListView).toBeDefined();
                    expect(tiledAttachmentListView instanceof TiledAttachmentListView).toBe(true);
                }); 
            });

            describe('with opts.content', function() {
                var tiledAttachmentListView = new TiledAttachmentListView({ content: content });
                it('is instance of TiledAttachmentListView', function() {
                    expect(tiledAttachmentListView).toBeDefined();
                    expect(tiledAttachmentListView instanceof TiledAttachmentListView).toBe(true);
                }); 
            });
        });

        describe('when removing an attachment', function () {

            it('calls .retile', function () {
                var tiledAttachmentListView = new TiledAttachmentListView({ content: content });
                tiledAttachmentListView.add(oembedAttachment);
                spyOn(tiledAttachmentListView, 'retile');
                tiledAttachmentListView.remove(oembedAttachment);
                expect(tiledAttachmentListView.retile).toHaveBeenCalled(); 
            });
        });

        describe('when adding an attachment', function() {

            it('calls .retile', function () {
                var tiledAttachmentListView = new TiledAttachmentListView({ content: content });
                spyOn(tiledAttachmentListView, 'retile');
                tiledAttachmentListView.add(oembedAttachment);
                expect(tiledAttachmentListView.retile).toHaveBeenCalled(); 
            });

            describe('with photo attachment', function() {
                var tiledAttachmentListView = new TiledAttachmentListView({ content: content });
                tiledAttachmentListView.setElement($('<div></div>'));
                tiledAttachmentListView.render();
                oembedAttachment.type = 'photo';
                tiledAttachmentListView.add(oembedAttachment);

                it('is a tiled attachment (appended to .content-attachments-tiled)', function() {
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled')).toContain('.content-attachment');
                    expect(tiledAttachmentListView.$el.find('.content-attachments-stacked')).toBeEmpty();
                });
            });

            describe('with video attachment', function() {
                var tiledAttachmentListView = new TiledAttachmentListView({ content: content });
                tiledAttachmentListView.setElement($('<div></div>'));
                tiledAttachmentListView.render();
                oembedAttachment.type = 'video';
                tiledAttachmentListView.add(oembedAttachment);

                it('is a tiled attachment (appended to .content-attachments-tiled)', function() {
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled')).toContain('.content-attachment');
                    expect(tiledAttachmentListView.$el.find('.content-attachments-stacked')).toBeEmpty();
                });
            });

            describe('with link attachment', function() {
                var tiledAttachmentListView = new TiledAttachmentListView({ content: content });
                tiledAttachmentListView.setElement($('<div></div>'));
                tiledAttachmentListView.render();
                oembedAttachment.type = 'link';
                tiledAttachmentListView.add(oembedAttachment);

                it('is a stacked attachment (appended to .content-attachments-stacked)', function() {
                    expect(tiledAttachmentListView.$el.find('.content-attachments-stacked')).toContain('.content-attachment');
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled')).toBeEmpty();
                });
            });

            describe('with rich attachment', function() {
                var tiledAttachmentListView = new TiledAttachmentListView({ content: content });
                tiledAttachmentListView.setElement($('<div></div>'));
                tiledAttachmentListView.render();
                oembedAttachment.type = 'rich';
                tiledAttachmentListView.add(oembedAttachment);

                it('is a stacked attachment (appended to .content-attachments-stacked)', function() {
                    expect(tiledAttachmentListView.$el.find('.content-attachments-stacked')).toContain('.content-attachment');
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled')).toBeEmpty();
                });
            });
        });

        describe('when rendering', function() {

            describe('with 1 tiled attachment', function() {
                var tiledAttachmentListView = new TiledAttachmentListView({ content: content });
                tiledAttachmentListView.setElement($('<div></div>'));
                tiledAttachmentListView.render();
                oembedAttachment.type = 'photo';
                tiledAttachmentListView.add(oembedAttachment);

                it('has .content-attachments-1 class name', function() {
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled')).toHaveClass('content-attachments-1');
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled .content-attachment')).toHaveClass('content-attachment-square-tile');
                });
            });

            describe('with 2 tiled attachments', function() {
                var tiledAttachmentListView = new TiledAttachmentListView({ content: content });
                tiledAttachmentListView.setElement($('<div></div>'));
                tiledAttachmentListView.render();
                oembedAttachment.type = 'photo';
                for (var i=0; i < 2; i++) {
                    tiledAttachmentListView.add(oembedAttachment);
                }

                it('has .content-attachments-2 class name', function() {
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled')).toHaveClass('content-attachments-2');
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled .content-attachment')).toHaveClass('content-attachment-square-tile');
                });
            });

            describe('with 3 tiled attachments', function() {
                var tiledAttachmentListView = new TiledAttachmentListView({ content: content });
                tiledAttachmentListView.setElement($('<div></div>'));
                tiledAttachmentListView.render();
                oembedAttachment.type = 'photo';
                for (var i=0; i < 3; i++) {
                    tiledAttachmentListView.add(oembedAttachment);
                }

                it('has .content-attachments-3 class name', function() {
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled')).toHaveClass('content-attachments-3');
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled > *:nth-child(1) .content-attachment'))
                        .toHaveClass('content-attachment-horizontal-tile');
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled > *:nth-child(2) .content-attachment'))
                        .toHaveClass('content-attachment-square-tile');
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled > *:nth-child(3) .content-attachment'))
                        .toHaveClass('content-attachment-square-tile');
                });
            });

            describe('with 4 tiled attachments', function() {
                var tiledAttachmentListView = new TiledAttachmentListView({ content: content });
                tiledAttachmentListView.setElement($('<div></div>'));
                tiledAttachmentListView.render();
                oembedAttachment.type = 'photo';
                for (var i=0; i < 4; i++) {
                    tiledAttachmentListView.add(oembedAttachment);
                }

                it('has .content-attachments-4 class name', function() {
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled')).toHaveClass('content-attachments-4');
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled .content-attachment')).toHaveClass('content-attachment-square-tile');
                });
            });

            describe('with > 4 tiled attachments', function() {
                var tiledAttachmentListView = new TiledAttachmentListView({ content: content });
                tiledAttachmentListView.setElement($('<div></div>'));
                tiledAttachmentListView.render();
                oembedAttachment.type = 'photo';
                for (var i=0; i < 9; i++) {
                    tiledAttachmentListView.add(oembedAttachment);
                }

                it('has only .content-attachments-tiled class name', function() {
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled')[0].className).toBe('content-attachments-tiled');
                    expect(tiledAttachmentListView.$el.find('.content-attachments-tiled .content-attachment')).toHaveClass('content-attachment-horizontal-tile');
                });
            });
        });

        describe('when clicking an attachment tile', function() {
            
            var tiledAttachmentListView,
                tiledAttachmentEl,
                tiledAttachmentListViewOpts = { content: content };

            it('emits focusContent.hub event', function() {
                tiledAttachmentListView = new TiledAttachmentListView(tiledAttachmentListViewOpts);
                tiledAttachmentListView.setElement($('<div></div>'));
                tiledAttachmentListView.render();
                oembedAttachment.type = 'photo';
                for (var i=0; i < 3; i++) {
                    tiledAttachmentListView.add(oembedAttachment);
                }
                tiledAttachmentEl = tiledAttachmentListView.$el.find('.content-attachment:first');

                var spyFocusAttachmentEvent = spyOnEvent(tiledAttachmentEl[0], 'focusContent.hub');
                var tileClicked = false;
                tiledAttachmentListView.$el.on('focusContent.hub', function() {
                    tileClicked = true;
                });

                tiledAttachmentEl.trigger('click');
                expect(tileClicked).toBe(true);
                expect(spyFocusAttachmentEvent).toHaveBeenTriggered();
            });
        });
    });

});

