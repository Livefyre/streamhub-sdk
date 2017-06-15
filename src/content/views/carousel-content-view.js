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
     * @type {FakeCollection=}
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
        console.log(this.collection.contents.length, this.contentIdx);
        this.updateContentIndex();
        this.maybeToggleArrows();
    }.bind(this));
}
inherits(CarouselContentView, View);

/** @override */
CarouselContentView.prototype.events = View.prototype.events.extended({
    'click .hub-modal-arrow-left': function () {
        this.navigate(0);
    },
    'click .hub-modal-arrow-right': function () {
        if (!this.navigate(1)) {
            return;
        }
        // Trigger show more
        if (this.listView && this.contentIdx + 1 === this.collection.contents.length) {
            this.listView.$el.trigger('showMore.hub');
        }
    }
});

CarouselContentView.prototype.template = template;
CarouselContentView.prototype.elTag = 'div';
CarouselContentView.prototype.elClass = 'content-carousel';
CarouselContentView.prototype.arrowDisabled = 'hub-modal-arrow-disable';
CarouselContentView.prototype.arrowLeftSelector = '.hub-modal-arrow-left';
CarouselContentView.prototype.arrowRightSelector = '.hub-modal-arrow-right';
CarouselContentView.prototype.containerSelector = '.content-container';

/**
 * Creates a new view for the provided `content` and add it to the container.
 * @param {Content} content The content to add to the DOM.
 */
CarouselContentView.prototype.addContentToDOM = function (content) {
    var view = new ModalContentCardView({
        content: content,
        productOptions: this.opts.productOptions
    });
    this.$el.find(this.containerSelector).html('').append(view.$el);
    view.render();
};

/** @override */
CarouselContentView.prototype.getTemplateContext = function () {
    return {navigationEnabled: this.navigationEnabled};
};

/**
 * Maybe toggle the navigation arrows depending on whether there is sibling
 * content to the left or right of the currently visible content.
 */
CarouselContentView.prototype.maybeToggleArrows = function () {
    this.$el.find(this.arrowLeftSelector).toggleClass(this.arrowDisabled, this.contentIdx === 0);
    this.$el.find(this.arrowRightSelector).toggleClass(this.arrowDisabled,
        this.collection.contents.length - 1 === this.contentIdx);
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
    if (!this.collection.contents[this.contentIdx + idxChange]) {
        return false;
    }
    this.contentIdx += idxChange;
    this.addContentToDOM(this.collection.contents[this.contentIdx]);
    this.content = this.collection.contents[this.contentIdx];
    this.maybeToggleArrows();
    return true;
};

/** @override */
CarouselContentView.prototype.render = function () {
    View.prototype.render.apply(this, arguments);
    this.addContentToDOM(this.opts.content);
    this.navigationEnabled && this.maybeToggleArrows();
    return this;
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
