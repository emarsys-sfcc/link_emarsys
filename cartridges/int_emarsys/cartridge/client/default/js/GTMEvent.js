'use strict';

var analyticsData = {};

if (window.emarsysAnalyticsData) {
    analyticsData = window.emarsysAnalyticsData.emarsysAnalytics; // analytics data for SFRA
} else if (window.pageContext) {
    analyticsData = window.pageContext.analytics; // analytics data for SiteGenesis
}

/**
 * @description Sets google analytics triggers
 */
function initGTMEvent() {
    if (!('dataLayer' in window)) { return; }

    var pageType = analyticsData.pageType;
    if (pageType) {
        window.dataLayer.push({
            event: analyticsData.pageType,
            pageAnalyticsData: analyticsData
        });
    }
}

/**
 * @description Sets google quickViewClick trigger
 */
function quickView() {
    var targetElement = analyticsData.isSFRA ? '.product' : '.product-tile';
    var targetData = analyticsData.isSFRA ? 'pid' : 'itemid';

    $(targetElement).on('click', '.quickview', function (e) {
        var productItemID = $(e.delegateTarget).data(targetData);
        window.dataLayer.push({
            event: 'quickViewClick',
            productItemID: productItemID
        });
    });
}

/**
 * @description Sets google addItemToCart trigger
 */
function addItemToCart() {
    if (analyticsData.isSFRA) {
        $('body').on('product:afterAddToCart', function () {
            window.dataLayer.push({
                event: 'addItemToCart',
                emarsysUrl: EmarsysUrls.emarsysAddToCartAjax
            });
        });
    }
}

module.exports = {
    init: function () {
        if (analyticsData.isEnableEmarsys && analyticsData.analyticApproach === 'scarabGTMIntegration') {
            initGTMEvent();
            quickView();
            addItemToCart();
        }
    }
};
