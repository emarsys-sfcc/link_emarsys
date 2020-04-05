'use strict';

var ScarabQueueHelper = new (require('int_emarsys/cartridge/scripts/helpers/scarabQueueHelper'))();
var customPreferences = require('dw/system/Site').getCurrent().getPreferences().getCustom();
var recommendationType = customPreferences.emarsysPredictPDPRecommendationType.value;
var isSFRA = true;

/**
 * @description Create full name for taking correct Preference
 * @param {Object} namePreference name Preference
 * @returns {Object} return object for Preference
 */
function getEmarsysPreference(namePreference) {
    var fullNamePref = 'emarsysPredict' + namePreference + 'RecommendationType';

    return customPreferences[fullNamePref].value;
}

/**
 * @description Сreating a product analytics object
 * @param {Object} data analytics data object, create in controller
 * @returns {Object} object for Product analytics
 */
function getProductData(data) {
    var analytics = {
        nameTracking: 'view',
        trackingData: isSFRA
                        ? data.product.id
                        : data.pdict.Product.ID
    };

    if (recommendationType !== 'disable') {
        analytics.logic = getEmarsysPreference('PDP');
    }

    return analytics;
}

/**
 * @description Сreating a category analytics object
 * @param {Object} data analytics data object, created in controller
 * @returns {Object} object for Category nalytics
 */
function getCategoryPageData(data) {
    var category = isSFRA
                    ? data.productSearch.category
                    : data.pdict.ProductSearchResult.category;

    var analytics = {
        nameTracking: 'category',
        trackingData: ScarabQueueHelper.getCategoryChain(category)
    };

    if (recommendationType !== 'disable') {
        analytics.logic = getEmarsysPreference('CategoryPage');
    }

    return analytics;
}

/**
 * @description Сreating a serch analytics object
 * @param {Object} data analytics data object, created in controller
 * @returns {Object} object for Search analytics
 */
function getSearchPageData(data) {
    var analytics = {
        nameTracking: 'searchTerm',
        trackingData: isSFRA
                        ? data.productSearch.searchPhrase
                        : request.httpParameterMap.q.value
    };
    if (recommendationType !== 'disable') {
        analytics.logic = getEmarsysPreference('SearchPage');
    }

    return analytics;
}

/**
 * @description Сreating a serch analytics object
 * @param {Object} data analytics data object, created in controller
 * @returns {Object} object for Search analytics
 */
function getSearchesData(data) {
    var analytics;
    if (isSFRA ? data.productSearch.categorySearch : data.pdict.ProductSearchResult.categorySearch) {
        analytics = getCategoryPageData(data);
    } else if (!empty(request.httpParameterMap.q.value)) {
        analytics = getSearchPageData(data);
    }

    return analytics;
}

/**
 * @description Сreating a order confirmation analytics object
 * @param {Object} data analytics data object, created in controller
 * @returns {Object} object for OrderConfirmation analytics
 */
function getOrderConfirmationData(data) {
    var order = isSFRA ? data.order : data.pdict.Order;
    var analytics = {
        nameTracking: 'purchase',
        trackingData: ScarabQueueHelper.getOrderData(order)
    };
    if (recommendationType) {
        analytics.logic = getEmarsysPreference('ThankYouForOrderPage');
    }

    return analytics;
}

/**
 * @description Сreating a cart analytics object
 * @param {Object} data analytics data object, created in controller
 * @returns {Object} object for Cart analytics
 */
function getCartData() {
    if (recommendationType !== 'disable') {
        return {
            logic: getEmarsysPreference('CartPage')
        };
    }

    return {};
}

/**
 * @description Сreating a storefront analytics object
 * @param {Object} data analytics data object, created in controller
 * @returns {Object} object for Storefron analytics
 */
function getStorefrontData() {
    if (recommendationType !== 'disable') {
        return {
            logic: getEmarsysPreference('HomePage')
        };
    }

    return {};
}

/**
 * @description - Create objec with customer data for emarsys analytics
 * @param {Object} data analytics data object, created in controller
 * @returns {void}
 */
function getCustomerInfo(data) {
    var isCustomer = (customer.authenticated && customer.registered);
    var customerData = {
        guestEmail: Object.hasOwnProperty.call(data, 'order') ? data.order.getCustomerEmail() : '',
        isCustomer: isCustomer
    };

    if (isCustomer) {
        if (!empty(customer.profile.email)) {
            customerData.customerEmail = customer.profile.email;
        } else {
            customerData.customerNo = customer.profile.customerNo;
        }
    }

    return customerData;
}

/**
 * @description Add new properties in object data with a analytics data
 * @param {string|Objcet} args string for SFRA approach or Object for SiteGenesis approach
 * @param {Object} data analytics data object, created in controller (SFRA)
 * @returns {void} inserted in data new property "analytics" with type "object"
 */
function PageData() {
    this.setPageData = function (args, data) {
        var isEnableEmarsys = customPreferences.emarsysPredictEnableJSTrackingCode;
        var emarsysAnalytics = {};
        isSFRA = (typeof args === 'string');
        var pageType = isSFRA ? args : args.ns;

        if (isEnableEmarsys) {
            var mapping = {
                product: getProductData,
                search: getSearchesData,
                orderconfirmation: getOrderConfirmationData,
                cart: getCartData,
                storefront: getStorefrontData
            };

            if (pageType in mapping) {
                emarsysAnalytics = mapping[pageType](data || args);
                emarsysAnalytics.locale = request.locale;

                if (isSFRA) {
                    emarsysAnalytics.pageType = pageType;
                    emarsysAnalytics.customerData = getCustomerInfo(data);
                    emarsysAnalytics.currentBasket = ScarabQueueHelper.getCartData(require('dw/order/BasketMgr').getCurrentBasket());
                }
            }
        }

        emarsysAnalytics.predictMerchantID = customPreferences.emarsysPredictMerchantID;
        emarsysAnalytics.isEnableEmarsys = isEnableEmarsys;

        return emarsysAnalytics;
    };
}

module.exports = PageData;
