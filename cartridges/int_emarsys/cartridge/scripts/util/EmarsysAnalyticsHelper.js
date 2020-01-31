'use strict';

var ScarabQueueHelper = new (require('int_emarsys/cartridge/scripts/util/ScarabQueueHelper'))();
var currentSite = require('dw/system/Site').getCurrent();
var customPreferences = currentSite.getPreferences().getCustom();

/**
 * @description Create full name for taking correct Preference
 * @param {object} namePreference name Preference
 * @returns {object} return object for Preference
 */
function getEmarsysPreference(namePreference) {
    var fullNamePref = 'emarsysPredict' + namePreference + 'RecommendationType';

    return customPreferences[fullNamePref].value;
}

/**
 * @description Сreating a product analytics object
 * @param {object} pageContext page context global object, create in .isml
 * @returns {object} object for Product analytics
 */
function getProductData(pageContext) {
    var analytics = {
        nameTracking: 'view',
        trackingData: pageContext.pdict.Product.ID
    };
    if (pageContext.recommendationType !== 'disable') {
        analytics.logic = getEmarsysPreference('PDP');
    }

    return analytics;
}

/**
 * @description Сreating a category analytics object
 * @param {object} pageContext page context global object, created in .isml
 * @returns {object} object for Category nalytics
 */
function getCategoryPageData(pageContext) {
    var analytics = {
        nameTracking: 'category',
        trackingData: ScarabQueueHelper.getCategoryChain(pageContext.pdict.ProductSearchResult.category)
    };
    if (pageContext.recommendationType !== 'disable') {
        analytics.logic = getEmarsysPreference('CategoryPage');
    }

    return analytics;
}

/**
 * @description Сreating a serch analytics object
 * @param {object} pageContext page context global object, created in .isml
 * @returns {object} object for Search analytics
 */
function getSearchPageData(pageContext) {
    var analytics = {
        nameTracking: 'searchTerm',
        trackingData: request.httpParameterMap.q.value
    };
    if (pageContext.recommendationType !== 'disable') {
        analytics.logic = getEmarsysPreference('SearchPage');
    }

    return analytics;
}

/**
 * @description Сreating a serch analytics object
 * @param {object} pageContext page context global object, created in .isml
 * @returns {object} object for Search analytics
 */
function getSearchesData(pageContext) {
    var analytics;
    if(pageContext.ns === 'search' && pageContext.pdict.ProductSearchResult.categorySearch) {
        analytics = getCategoryPageData(pageContext);
    } else if (!empty(request.httpParameterMap.q.value)) {
        analytics = getSearchPageData(pageContext);
    }

    return analytics;
}

/**
 * @description Сreating a order confirmation analytics object
 * @param {object} pageContext page context global object, created in .isml
 * @returns {object} object for OrderConfirmation analytics
 */
function getOrderConfirmationData(pageContext) {
    var analytics = {
        nameTracking: 'purchase',
        trackingData: ScarabQueueHelper.getOrderData(pageContext.pdict.Order)
    };
    if (pageContext.recommendationType) {
        analytics.logic = getEmarsysPreference('ThankYouForOrderPage');
    }

    return analytics;
}

/**
 * @description Сreating a cart analytics object
 * @param {object} pageContext page context global object, created in .isml
 * @returns {object} object for Cart analytics
 */
function getCartData(pageContext) {
    if (pageContext.recommendationType !== 'disable') {
        return {
            logic: getEmarsysPreference('CartPage')
        };
    }

    return {};
}

/**
 * @description Сreating a storefront analytics object
 * @param {object} pageContext page context global object, created in .isml
 * @returns {object} object for Storefron analytics
 */
function getStorefrontData(pageContext) {
    if (pageContext.recommendationType !== 'disable') {
        return {
            logic: getEmarsysPreference('HomePage')
        };
    }

    return {};
}

/**
 * @description Add new properties in object pageContext with a analytics data
 * @param {object} pageContext page context global object, created in .isml
 * @returns {void} inserted in pageContext new property "analytics" with type "object"
 */
function PageData() {
    this.setPageData = function(pageContext) {
        if (customPreferences.emarsysPredictEnableJSTrackingCode) {
            var mapping = {
                product: getProductData,
                search: getSearchesData,
                orderconfirmation: getOrderConfirmationData,
                cart: getCartData,
                storefront: getStorefrontData
            };
            pageContext.predictMerchantID = currentSite.getCustomPreferenceValue('emarsysPredictMerchantID');
            if (pageContext.ns in mapping) {
                pageContext.recommendationType = customPreferences.emarsysPredictPDPRecommendationType.value;
                var analytics = mapping[pageContext.ns](pageContext);
                analytics.trackingCode = customPreferences.emarsysPredictEnableJSTrackingCode;
                analytics.locale = request.locale;

                return analytics;
            }
        } else {
            return {
                trackingCode: false
            };
        }
    };
}

module.exports = PageData;
