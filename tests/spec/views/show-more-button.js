define(['jasmine', 'streamhub-sdk/views/show-more-button', 'streamhub-sdk/views/streams/more'],
function (jasmine, ShowMoreButton, More) {
	'use strict';

	describe('streamhub-sdk/views/show-more-button', function () {
		it('is a constructor', function () {
			expect(ShowMoreButton).toEqual(jasmine.any(Function));
		});
		it('can be constructed with opts.moreStream', function () {
			var moreStream = new More(),
				showMoreButton = new ShowMoreButton({
					more: moreStream
				});
			expect(showMoreButton.getMoreStream()).toBe(moreStream);
		});
		it('can have the more stream set with .setMoreStream', function () {
			var showMoreButton = new ShowMoreButton(),
				moreStream = new More();
			showMoreButton.setMoreStream(moreStream);
			expect(showMoreButton.getMoreStream()).toBe(moreStream);
		});
		it('triggers showMore.hub when clicked', function () {
			var showMoreButton = new ShowMoreButton(),
				onShowMore = jasmine.createSpy('showMore.hub');
			showMoreButton.$el.on('showMore.hub', onShowMore);
			showMoreButton.$el.click();
			expect(onShowMore).toHaveBeenCalled();
		});
	});
});