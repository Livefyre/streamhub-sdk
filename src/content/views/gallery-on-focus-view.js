define([
	'streamhub-sdk/util',
	'streamhub-sdk/view',
	'streamhub-sdk/content/views/gallery-attachment-list-view'
], function (util, View, GalleryAttachmentListView) {


	/**
	 * A View that initially renders the passed view, but on focusContent.hub,
	 * shows a GalleryAttachmentListView instead
	 */
	var GalleryOnFocusView = function (initialView, opts) {
		this._isGallery = false;
		this._initialView = initialView;
		View.call(this, opts);
	};
	util.inherits(GalleryOnFocusView, View);


	GalleryOnFocusView.prototype.render = function () {
		View.prototype.render.call(this);
		this._initialView.$el.appendTo(this.$el);
		this._initialView.render();
	}


	GalleryOnFocusView.prototype.focus = function (attachment) {
		if (this._isGallery) {
			return;
		}
		var galleryView = this._createFocusedView({
			content: this._initialView.content,
			attachmentToFocus: attachment
		});
		galleryView.$el.appendTo(this.$el);
		galleryView.render();
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
