'use strict';

var analyticsData = false;

if (window.emarsysAnalyticsData) {
    analyticsData = window.emarsysAnalyticsData.emarsysAnalytics;
} else if (window.pageContext) {
    analyticsData = window.pageContext.analytics;
}

/**
 * @description Sets google analytics triggers
 */
function initGTMEvent() {
    if (!('dataLayer' in window)) { return; }

    dataLayer.push({
        event: 'emarsysAnalyticInit',
        pageAnalyticsData: analyticsData
    });

    var pageDataObject = window.dataLayer.find(function (item) {
        return 'pageAnalyticsData' in item;
    });

    if (!pageDataObject) { return; }

    var nameTracking = pageDataObject.pageAnalyticsData.nameTracking;
    if (nameTracking) {
        window.dataLayer.push({
            event: pageDataObject.pageAnalyticsData.pageType
        });
    }
}

/**
 * @description Sets google quickViewClick trigger
 */
function googleQuickView() {
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
function googleAddItemToCart() {
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
        if (analyticsData.isEnableEmarsys && analyticsData.AnalyticApproach === 'sendDataWithGTM') {
            initGTMEvent();
            googleQuickView();
            googleAddItemToCart();
        }
    }
};
