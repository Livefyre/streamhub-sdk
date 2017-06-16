var $ = require('streamhub-sdk/jquery');
var i18n = require('streamhub-sdk/i18n');
var isBoolean = require('mout/lang/isBoolean');
var JsTruncateHtml = require('js-truncate-html');
var template = require('hgn!streamhub-sdk/content/templates/content-body-show-more');

/**
 * HTML truncater. This is used to truncate the body without losing html
 * elements within it.
 * @type {JsTruncateHtml}
 */
var truncator = new JsTruncateHtml({
    includeElipsis: true,
    elipsisLength: 1,
    elipsisCharacter: '&hellip;'
});

/**
 * Mixin for adding truncation logic to a body view if enabled. Overrides
 * `getTemplateContext` to truncate the body of the content and `render` to add
 * the "view more" / "view less" buttons depending on truncation state.
 * @param {View} view The body view to modify.
 * @param {Object} opts Configuration options.
 */
module.exports = function (view, opts) {
    // Truncation is not enabled.
    if (!opts.showMoreEnabled) {
        return;
    }

    /**
     * Whether the body is truncatable or not.
     * @type {boolean}
     */
    var isBodyTruncatable = false;

    /**
     * Whether the body is currently truncated or not.
     * @type {boolean}
     */
    var truncated = true;

    // Override event listener to add the show more button click.
    view.events = view.events.extended({
        'click .content-body-show-more': function(e) {
            e.stopPropagation();
            truncated = !truncated;
            this.render();
        }
    });
    if (view.el) {
        view.delegateEvents();
    }

    /**
     * Adding body truncation to the template context.
     * @override
     */
    var oldGetContext = view.getTemplateContext;
    view.getTemplateContext = function () {
        var context = oldGetContext.apply(view, arguments);
        var body = context.bodyOrig || context.body;

        var div = document.createElement('div');
        div.innerHTML = body;
        var bodyText = div.innerText;
        isBodyTruncatable = bodyText.length > 125;

        // If the body is truncatable and is to be truncated, do the actual
        // truncation and set it on the context.
        if (isBodyTruncatable && truncated) {
            // Ensure that the body is wrapped in paragraphs before truncating
            // so that we can pull them off and truncate.
            if (!/^<p/.test(body)) {
                body = '<p>' + $.trim(body) + '</p>';
            }
            body = truncator.truncate($(body).html(), 124);
            context.body = '<p>' + $.trim(body) + '</p>';
        }
        return context;
    };

    /**
     * Adding view more/less button to the last paragraph of the body.
     * @override
     */
    var oldRender = view.render;
    view.render = function () {
        oldRender.apply(view, arguments);

        // If the body is too short to be truncatable, the button shouldn't show
        // up at all.
        if (!isBodyTruncatable) {
            return this;
        }

        this.$el.find('.content-body-main p:last-child').append($.trim(template({
            cls: truncated ? 'view-more' : 'view-less',
            text: truncated ? i18n.get('viewMore', 'View More') : i18n.get('viewLess', 'View Less')
        })));
        return this;
    };
};
