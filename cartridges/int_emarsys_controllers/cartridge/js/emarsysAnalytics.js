'use strict';

window.ScarabQueue = window.ScarabQueue || [];

/**
 * @description create new array for save analytics data
 */
function initScarabQueue() {
    (function (subdomain, id) {
        if (document.getElementById(id)) {
            return;
        }
        var js = document.createElement('script');
        js.id = id;
        js.src = subdomain + '.scarabresearch.com/js/' + pageContext.predictMerchantID + '/scarab-v2.js';
        var fs = document.getElementsByTagName('script')[0];
        fs.parentNode.insertBefore(js, fs);
    })('https:' === document.location.protocol ? 'https://recommender' : 'http://cdn', 'scarab-js-api');
}

/**
 * @description Taking the attribute from the tag see with the value of the recycle bin
 * @returns {object} basket
 */
function getBasketAttr() {
    var basketData = $('.analyticBasket').data();

    return basketData.basketAnalytics.Basket;
}

/**
 * @description Taking the attribute from the tag see with the value of the customer
 * @returns {object} basket
 */
function getCustomerAttr() {
    var customer = $('.analyticCustomer').data();

    return customer.customerAnalytics.Customer;
}

/**
 * @description Push object recommendations in ScarabQueue object
 * @param {object} object is analytic data
 */
function setRecommendations(object) {
    if (Object.hasOwnProperty.call(object, 'logic')) {
        window.ScarabQueue.push(['recommend', {
            logic: object.logic,
            containerId: 'predict-recs'
        }]);
    }
}

/**
 * @description an overlay is applied to the button to send analytics
 */
function initQuickViewAnalytics() {
    var analyticsData = pageContext && pageContext.analytics;

    if (analyticsData && analyticsData.trackingCode) {
        $('.product-tile').on('click', '.quickview', function () {
            window.ScarabQueue.push(['view', $(this).closest('.product-tile').data('itemid')]);
            window.ScarabQueue.push(['go']);
        });
    }
}

/**
 * @description call function
 * @param {string} nameFunc  name function
 * @param {Object} customerData customer data
 */
function addData(nameFunc ,customerData) {
    var analyticsData = pageContext && pageContext.analytics;

    switch (nameFunc) {
        case 'product':
        case 'orderconfirmation':
        case 'search':
            window.ScarabQueue.push([analyticsData.nameTracking, analyticsData.trackingData]);
            setRecommendations(analyticsData);
            break;
        case 'availabilityZone':
            window.ScarabQueue.push(['availabilityZone', analyticsData.locale]);
            break;
        case 'basket':
            window.ScarabQueue.push(['cart', getBasketAttr()]);
            break;
        case 'cart':
        case 'storefront':
            setRecommendations(analyticsData);
            break;
        case 'customerEmail':
            window.ScarabQueue.push(['setEmail', customerData.CustomerEmail]);
            break;
        case 'customerId':
            window.ScarabQueue.push(['setCustomerId', customerData.CustomerNo]);
            break;
        case 'guestEmail':
            window.ScarabQueue.push(['setEmail', customerData.GuestEmail]);
            break;
        default:
            break;
    }
}
/**
 * @description Create analytics data
 */
function addPageData() {
    var analyticsData = pageContext && pageContext.analytics;
    if (analyticsData && analyticsData.trackingCode) {
        var customerData = getCustomerAttr();
        addData('availabilityZone');
        addData('basket');

        if (customerData.IsCustomer) {
            if (Object.hasOwnProperty.call(customerData, 'CustomerEmail')) {
                addData('customerEmail', customerData);
            } else {
                addData('customerId' ,customerData);
            }
        } else if (customerData.PageContext === 'orderconfirmation') {
            addData('guestEmail', customerData);
        }
        addData(window.pageContext.ns);

        window.ScarabQueue.push(['go']); // Submit all information available on page load
    }
}

/**
 * @description Insertion full informations analytics in ScarabQueue object
 * @param {object} pageContext page context global object, created in .isml
 */
function init() {
    initScarabQueue();
    addPageData();
    initQuickViewAnalytics();
}

module.exports = init;
