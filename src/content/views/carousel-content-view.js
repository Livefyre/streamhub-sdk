var $ = require('streamhub-sdk/jquery');
var debounce = require('mout/function/debounce');
var enums = require('streamhub-sdk/enums');
var findIndex = require('mout/array/findIndex');
var inherits = require('inherits');
var ListView = require('streamhub-sdk/views/list-view');
var ModalContentCardView = require('streamhub-sdk/content/views/modal-content-card-view');
var template = require('hgn!streamhub-sdk/content/templates/carousel-content-view');
var util = require('streamhub-sdk/util');
var View = require('view');

// Set up a comparator map so that the ListView comparator can be mapped to a
// more common string value that can be easily used instead of trying to figure
// out what the function comparator is.
var COMPARATORS = ListView.prototype.comparators;
var COMPARATOR_MAP = {};
COMPARATOR_MAP[COMPARATORS.CREATEDAT_ASCENDING] = enums.SORT_ORDER.CREATED_AT_ASC;
COMPARATOR_MAP[COMPARATORS.CREATEDAT_DESCENDING] = enums.SORT_ORDER.CREATED_AT_DESC;
COMPARATOR_MAP[COMPARATORS.SORT_ORDER_ASCENDING] = enums.SORT_ORDER.SORT_ORDER_ASC;
COMPARATOR_MAP[COMPARATORS.SORT_ORDER_DESCENDING] = enums.SORT_ORDER.SORT_ORDER_DESC;

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

    // Change the sort order of the collection to the order of the parent list
    // view so the content is consistent.
    this.collection.setSortOrder(COMPARATOR_MAP[this.listView.comparator]);

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

/**
 * Classes that, when clicked, will cause the modal to close.
 * @const {Array.<string>}
 */
CarouselContentView.CLOSE_CLASSES = [
    'hub-modal-content',
    'hub-modal-close',
    'hub-modal-content-view',
    'content-container'
];

CarouselContentView.prototype.template = template;
CarouselContentView.prototype.elTag = 'div';
CarouselContentView.prototype.elClass = 'content-carousel';
CarouselContentView.prototype.arrowDisabledClass = 'hub-modal-arrow-disable';
CarouselContentView.prototype.hideSocialBrandingWithRightsClassName = 'fyr-hide-branding-when-granted';
CarouselContentView.prototype.arrowLeftSelector = '.hub-modal-arrow-left';
CarouselContentView.prototype.arrowRightSelector = '.hub-modal-arrow-right';
CarouselContentView.prototype.containerSelector = '.content-container';
CarouselContentView.prototype.modalSelector = '.hub-modal';

/** @override */
CarouselContentView.prototype.events = View.prototype.events.extended({}, function (events) {
    events['click .hub-modal-arrow-left'] = this.navigate.bind(this, 0);
    events['click .hub-modal-arrow-right'] = this.navigate.bind(this, 1);
    events['click'] = this.handleClick.bind(this);
    events['imageError.hub'] = this.navigate.bind(this, 1);
    events['igNativeLoaded.hub'] = this.repositionView.bind(this);
});

/**
 * Creates a new view for the provided `content` and add it to the container.
 * @param {Content} content The content to add to the DOM.
 */
CarouselContentView.prototype.addContentToDOM = function (content) {
    this.view = new ModalContentCardView({
        content: content,
        doNotTrack: this.opts.doNotTrack,
        hideSocialBrandingWithRights: this.opts.hideSocialBrandingWithRights,
        modal: this.opts.modal,
        productOptions: this.opts.productOptions,
        showCTA: this.opts.showCTA
    });
    this.$el.find(this.containerSelector).html('').append(this.view.$el);
    this.view.render();
    this.repositionView();
    this.view.onInsert();

    // Clean up the modal element by removing the instagram class if the content
    // is not an instagram video. This keeps the modal orientation correct.
    if (!this.isInstagram(content)) {
        this.$el.closest(this.modalSelector).removeClass('instagram-content');
    }
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
    evt.preventDefault();
    evt.stopPropagation();
    evt.keyCode === 37 && this.navigate(0);
    evt.keyCode === 39 && this.navigate(1);
};

/**
 * Handle a click on the modal.
 * @param {Event} evt Click event.
 */
CarouselContentView.prototype.handleClick = function (evt) {
    var CLOSE_CLASSES = CarouselContentView.CLOSE_CLASSES;
    var $target = $(evt.target);

    for (var i = 0; i < CLOSE_CLASSES.length; i++) {
        if ($target.hasClass(CLOSE_CLASSES[i])) {
            this.$el.trigger('hideModal.hub');
            break;
        }
    }
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
 * Whether content is Instagram content or not.
 * @return {boolean} If the content is from Instagram.
 */
CarouselContentView.prototype.isInstagram = function (content) {
    return content.source === 'instagram';
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

    // Adds a class which will be used by the CSS to hide branding on social
    // content when rights are granted.
    this.$el.toggleClass(this.hideSocialBrandingWithRightsClassName, this.opts.hideSocialBrandingWithRights);
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

    var self = this;
    setTimeout(function () {
        util.raf(function () {
            var carouselMinHeight = parseInt(self.$el.css('minHeight').split('px')[0], 10);
            var minHeight = window.innerWidth < 810 ? window.innerHeight : carouselMinHeight;
            var cardHeight = self.view.$el.height();
            var newPadding = '';

            // The content card height is less than the min-height specified by
            // the modal, add some padding to make it centered vertically. This
            // resolves issues where text-only content causes the navigation
            // arrows to bounce around during navigation.
            if (cardHeight < minHeight) {
                newPadding = (minHeight - cardHeight) / 2;
            }

            // If the window has a narrow width, make sure that there is enough
            // padding to support the modal close button.
            if (window.innerWidth < 660) {
                newPadding = Math.max(newPadding, 60);
            }

            // Ensure newPadding has `px` on it, otherwise it's not valid CSS.
            // The reason it wouldn't be a number is if neither of the if
            // statements above are executed.
            if (typeof newPadding === 'number') {
                newPadding += 'px';
            }
            self.$el.find(self.containerSelector).css('paddingTop', newPadding);

            // Update the min-height of the modal if it's in horizontal mode and
            // the card height is greater than 600. This solves for the case
            // when the screen is large and the cards are bigger.
            if (window.innerWidth < 810 || cardHeight <= 600) {
                return;
            }
            self.$el.css('minHeight', cardHeight + 'px');
        });
    }, 10);
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
