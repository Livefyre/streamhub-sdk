define([
	'inherits',
	'streamhub-sdk/view',
	'streamhub-sdk/content/views/gallery-attachment-list-view',
	'streamhub-sdk/content/views/attachment-list-view'
], function (inherits, View, GalleryAttachmentListView, AttachmentListView) {
    'use strict';

	/**
	 * A View that initially renders the passed view, but on focusContent.hub,
	 * shows a GalleryAttachmentListView instead
	 */
	var GalleryOnFocusView = function (initialView, opts) {
		opts = opts || {};
		this._isGallery = false;
		this._initialView = initialView;
		AttachmentListView.call(this, opts);
	};
	inherits(GalleryOnFocusView, AttachmentListView);

	GalleryOnFocusView.prototype.setContent = function (content) {
		this._initialView.setContent(content);
		AttachmentListView.prototype.setContent.call(this, content);
	};

	GalleryOnFocusView.prototype.add = function (attachment) {
		AttachmentListView.prototype.add.call(this, attachment);
		//this._initialView.add(attachment);
		if (this._focusedView) {
			this._focusedView.add(attachment);
		}
	};

	GalleryOnFocusView.prototype.render = function () {
		AttachmentListView.prototype.render.call(this);
		this._initialView.$el.appendTo(this.$el);
		this._initialView.render();
	};


	GalleryOnFocusView.prototype._insert = function (oembedView) {
		// Don't actually put anything in DOM. Subviews will do that.
	};

    GalleryOnFocusView.prototype.tileableCount = function () {
        if (this._initialView.tileableCount) {
            return this._initialView.tileableCount();
        }

        return 0;
    };


	GalleryOnFocusView.prototype.focus = function (attachment) {
		if (this._isGallery || (attachment.type !== 'photo' && attachment.type !== 'video')) {
			return;
		}
		this._focusedView = this._createFocusedView({
			content: this._initialView.content,
			attachmentToFocus: attachment
		});
		this._focusedView.$el.appendTo(this.$el);
		this._focusedView.render();

		this._initialView.$el.hide();
		this._isGallery = true;
	};


	GalleryOnFocusView.prototype._createFocusedView = function (opts) {
        var view = new GalleryAttachmentListView({
            content: opts.content,
            attachmentToFocus: opts.attachmentToFocus,
            userInfo: false,
            pageCount: false,
            pageButtons: false,
            thumbnails: true,
            proportionalThumbnails: true
        });
        view.$el.addClass('content-attachments-interactive-gallery');
        return view;
	};

	return GalleryOnFocusView;
});
