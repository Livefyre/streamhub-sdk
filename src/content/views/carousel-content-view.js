var debounce = require('mout/function/debounce');
var findIndex = require('mout/array/findIndex');
var inherits = require('inherits');
var ModalContentCardView = require('streamhub-sdk/content/views/modal-content-card-view');
var template = require('hgn!streamhub-sdk/content/templates/carousel-content-view');
var View = require('view');

/**
 * Navigatable content viev. If the collection is provided, navigation
 * functionality is enabled, meaning navigation arrows show up on both sides of
 * the content and clicking them will navigate to other pieces of content.
 * @extends {View}
 * @param {Object} opts Configuration options.
 */
function CarouselContentView(opts) {
    View.call(this, opts);

    /**
     * Collection to use when navigating.
     * @type {SortedCollection=}
     */
    this.collection = this.opts.collection;

    /**
     * Content to show.
     * @type {Content}
     */
    this.content = this.opts.content;

    /**
     * View that triggered this modal.
     * @type {View=}
     */
    this.listView = this.opts.listView;

    /**
     * Whether navigation is enabled. The collection must exist.
     * @type {boolean}
     */
    this.navigationEnabled = !!this.collection;

    // If no collection is provided, don't do any collection related shenanigans.
    if (!this.collection) {
        return;
    }

    // Find the currently content's index within the collection so that the
    // navigation and arrows can be maintained.
    this.updateContentIndex();

    // Listen for content added to the collection, re-find the index of the
    // content that is currently visible in case content came in from of it,
    // and maybe update the navigation arrows.
    this.collection.on('added', function () {
        this.updateContentIndex();
        this.maybeToggleArrows();
    }.bind(this));

    // Add a resize handler so the view can be adjusted when the window resizes.
    window.addEventListener('resize', debounce(this.repositionView.bind(this), 100));

    // Add a keyup handler to listen for arrow keys for keyboard navigation.
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
}
inherits(CarouselContentView, View);

/** @override */
CarouselContentView.prototype.events = View.prototype.events.extended({}, function (events) {
    events['click .hub-modal-arrow-left'] = this.navigate.bind(this, 0);
    events['click .hub-modal-arrow-right'] = this.navigate.bind(this, 1);
});

CarouselContentView.prototype.template = template;
CarouselContentView.prototype.elTag = 'div';
CarouselContentView.prototype.elClass = 'content-carousel';
CarouselContentView.prototype.arrowDisabledClass = 'hub-modal-arrow-disable';
CarouselContentView.prototype.arrowLeftSelector = '.hub-modal-arrow-left';
CarouselContentView.prototype.arrowRightSelector = '.hub-modal-arrow-right';
CarouselContentView.prototype.containerSelector = '.content-container';

/**
 * Creates a new view for the provided `content` and add it to the container.
 * @param {Content} content The content to add to the DOM.
 */
CarouselContentView.prototype.addContentToDOM = function (content) {
    this.view = new ModalContentCardView({
        content: content,
        productOptions: this.opts.productOptions
    });
    this.$el.find(this.containerSelector).html('').append(this.view.$el);
    this.view.render();
    this.repositionView();
};

/** @override */
CarouselContentView.prototype.getTemplateContext = function () {
    return {navigationEnabled: this.navigationEnabled};
};

/**
 * Handle the key up event. Only left or right arrow keys are allowed.
 * @param {Event} evt Key up event.
 */
CarouselContentView.prototype.handleKeyUp = function (evt) {
    evt.keyCode === 37 && this.navigate(0);
    evt.keyCode === 39 && this.navigate(1);
};

/**
 * Whether there is more content available through "show more".
 * @return {boolean} If there is more data.
 */
CarouselContentView.prototype.hasMore = function () {
    if (!this.listView || !this.listView.showMoreButton) {
        return false;
    }
    return this.listView.showMoreButton.isHolding() || false;
};

/**
 * Maybe toggle the navigation arrows depending on whether there is sibling
 * content to the left or right of the currently visible content. If there is
 * no more content in the collection to be fetched, the arrows should be enabled
 * since it will wrap around.
 */
CarouselContentView.prototype.maybeToggleArrows = function () {
    var hasMore = this.hasMore();
    this.$el.find(this.arrowLeftSelector).toggleClass(this.arrowDisabledClass,
        this.contentIdx === 0 && hasMore);
    this.$el.find(this.arrowRightSelector).toggleClass(this.arrowDisabledClass,
        this.collection.contents.length - 1 === this.contentIdx && hasMore);
};

/**
 * Navigate in the provided direction, `dir`. If `dir` is 0, the previous
 * content in the collection is shown. If `dir` is 1, the next content in the
 * collection is shown. Arrows are toggled in case either end of the collection
 * is reached.
 * @param {number} dir Direction to navigate.
 * @return {boolean} Whether the navigation occurred or not.
 */
CarouselContentView.prototype.navigate = function (dir) {
    var idxChange = dir === 0 ? -1 : 1;
    var hasMore = this.hasMore();

    if (!this.collection.contents[this.contentIdx + idxChange]) {
        // There are no items in the direction the user clicked. If there are
        // more items expected for the collection, don't do anything. If there
        // aren't, loop back around to the beginning or end depending on the
        // direction.
        if (hasMore) {
            return;
        }
        this.contentIdx = dir === 1 ? 0 : this.collection.contents.length - 1;
    } else {
        this.contentIdx += idxChange;
    }

    this.addContentToDOM(this.collection.contents[this.contentIdx]);
    this.content = this.collection.contents[this.contentIdx];
    this.maybeToggleArrows();

    // While navigation to the right (older content) and the last item in the
    // collection has been reached, trigger the show more action.
    if (dir === 1 && hasMore && this.listView && this.contentIdx + 1 === this.collection.contents.length) {
        this.listView.$el.trigger('showMore.hub');
    }
};

/** @override */
CarouselContentView.prototype.render = function () {
    View.prototype.render.apply(this, arguments);
    this.addContentToDOM(this.opts.content);
    this.navigationEnabled && this.maybeToggleArrows();
    return this;
};

/**
 * Reposition the view by modifying the padding to nudge it down in order to
 * center the navigation arrows with the content.
 */
CarouselContentView.prototype.repositionView = function () {
    if (!this.view) {
        return;
    }
    var carouselMinHeight = parseInt(this.$el.css('minHeight').split('px')[0], 10);
    var minHeight = window.innerWidth < 810 ? window.innerHeight : carouselMinHeight;
    var cardHeight = this.view.$el.height();
    var newPadding = '';

    // The content card height is less than the min-height specified by the
    // modal, add some padding to make it centered vertically. This resolves
    // issues where text-only content causes the navigation arrows to bounce
    // around during navigation.
    if (cardHeight < minHeight) {
        newPadding = ((minHeight - cardHeight) / 2) + 'px';
    }
    this.$el.find(this.containerSelector).css('paddingTop', newPadding);

    // Update the min-height of the modal if it's in horizontal mode and the
    // card height is greater than 600. This solves for the case when the screen
    // is large and the cards are bigger.
    if (window.innerWidth < 810 || cardHeight <= 600) {
        return;
    }
    this.$el.css('minHeight', cardHeight + 'px');
};

/**
 * Update `contentIdx` with the index of where the current content exists within
 * the collection. This is useful for navigation and to know if there is more
 * content on either side.
 */
CarouselContentView.prototype.updateContentIndex = function () {
    this.contentIdx = findIndex(this.collection.contents, {id: this.content.id});
};

module.exports = CarouselContentView;