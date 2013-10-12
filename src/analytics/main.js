define(['streamhub-sdk/analytics/ga', 'streamhub-sdk/debug'], function (ga, debug) {
    var log = debug('streamhub-sdk/analytics');

    var DEFAULT_GA_CODE = "UA-36968790-5";
    var DEFAULT_GA_TRACKER_NAME = "streamhubSdk";

    var Analytics = function (code, opts) {
        if (typeof code !== 'string') {
            opts = code;
            code = undefined;
        }
        this._gaCode = code || DEFAULT_GA_CODE;
        this._trackerName = DEFAULT_GA_TRACKER_NAME;
        this._createGa(opts);
    };

    Analytics.prototype.pageview = function () {
        this._ga('send', 'pageview');
    };

    Analytics.prototype._ga = function () {
        arguments[0] = this._trackerName + '.' + arguments[0];
        ga.apply(this, arguments);
    };

    Analytics.prototype._createGa = function (opts) {
        opts = opts || {};
        opts.name = this._trackerName;
        ga("create", this._gaCode, opts);
    };

/*
    ga("send", "pageview");
    ga('send', 'event', 'streamhub', 'view', 'ps4');
    ga('send', 'event', 'streamhub', 'click', 'nav buttons');
    ga('send', 'social', 'facebook', 'like', 'http://mycoolpage.com');
*/
    return Analytics;
});