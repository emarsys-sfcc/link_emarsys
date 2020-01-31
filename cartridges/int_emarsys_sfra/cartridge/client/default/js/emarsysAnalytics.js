'use strict';

window.ScarabQueue = window.ScarabQueue || [];

/**
 * @description create new array for save analytics data
 */
function initScarabQueue() {
    ((function (subdomain, id) {
        if (document.getElementById(id)) {
            return;
        }
        var js = document.createElement('script');
        js.id = id;
        js.src = subdomain + '.scarabresearch.com/js/' + window.analyticsData.emarsysAnalytics.predictMerchantID + '/scarab-v2.js';
        var fs = document.getElementsByTagName('script')[0];
        fs.parentNode.insertBefore(js, fs);
    })(document.location.protocol === 'https:' ? 'https://recommender' : 'http://cdn', 'scarab-js-api'));
}

/**
 * @description an overlay is applied to the button to send analytics
 */
function initQuickViewAnalytics() {
    var emarsysAnalytics = window.analyticsData && window.analyticsData.emarsysAnalytics;

    if (emarsysAnalytics && emarsysAnalytics.isEnableEmarsys) {
        $('.product').on('click', '.quickview', function () {
            window.ScarabQueue.push(['view', $(this).closest('.product').data('pid')]);
            window.ScarabQueue.push(['go']);
        });
    }
}
/**
 * @description an overlay is applied to the button to send analytics
 */
function initAddItemToCart() {
    $('body').on('product:afterAddToCart', function () {
        $.ajax({
            url: EmarsysUrls.emarsysAddToCartAjax
        }).done(function (data) {
            if (data) {
                window.ScarabQueue.push(['cart', data.cartObj]);
                window.ScarabQueue.push(['go']);
            }
        });
    });
}

/**
 * @description function generates ScarabQueue array for emarsys analytics
 */
function addPageData() {
    var analyticsData = window.analyticsData && window.analyticsData.emarsysAnalytics;

    if (analyticsData && analyticsData.isEnableEmarsys) {
        window.ScarabQueue.push(['availabilityZone', analyticsData.locale]);
        window.ScarabQueue.push(['cart', analyticsData.currentBasket]);
        var customerData = analyticsData.customerData;
        if (customerData.isCustomer) {
            if (customerData.customerEmail) {
                window.ScarabQueue.push(['setEmail', customerData.customerEmail]);
            } else {
                window.ScarabQueue.push(['setCustomerId', customerData.customerNo]);
            }
        } else if (analyticsData && analyticsData.pageType === 'orderconfirmation') {
            window.ScarabQueue.push(['setEmail', customerData.guestEmail]);
        }
        if (analyticsData && analyticsData.nameTracking && analyticsData.trackingData) {
            window.ScarabQueue.push([analyticsData.nameTracking, analyticsData.trackingData]);
        }
        if (analyticsData && analyticsData.logic) {
            window.ScarabQueue.push(['recommend', {
                logic: analyticsData.logic,
                containerId: 'predict-recs'
            }]);
        }

        window.ScarabQueue.push(['go']);
    }
}

module.exports = {
    init: function () {
        if (window.analyticsData && window.analyticsData.emarsysAnalytics.isEnableEmarsys) {
            initScarabQueue();
            addPageData();
            initQuickViewAnalytics();
            initAddItemToCart();
        }
    }
};
